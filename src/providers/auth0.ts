import { OAuth2Client } from "oslo/oauth2";

import type { OAuth2Provider } from "../index.js";

export class Auth0 implements OAuth2Provider {
	private client: OAuth2Client;
	private appDomain: string;
	private clientSecret: string;
	private scope: string[];

	constructor(
		appDomain: string,
		clientId: string,
		clientSecret: string,
		redirectURI: string,
		options?: {
			scope?: string[];
		}
	) {
		this.appDomain = appDomain;
		const authorizeEndpoint = this.appDomain + "/authorize";
		const tokenEndpoint = this.appDomain + "/token";
		this.client = new OAuth2Client(clientId, authorizeEndpoint, tokenEndpoint, {
			redirectURI
		});
		this.clientSecret = clientSecret;
		this.scope = options?.scope ?? [];
		this.scope.push("openid", "profile");
	}

	public async createAuthorizationURL(state: string): Promise<URL> {
		return await this.client.createAuthorizationURL({
			scope: this.scope,
			state
		});
	}
	public async validateAuthorizationCode(code: string): Promise<Auth0Tokens> {
		const result = await this.client.validateAuthorizationCode<TokenResponseBody>(code, {
			authenticateWith: "request_body",
			credentials: this.clientSecret
		});

		return {
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			idToken: result.id_token
		};
	}

	public async getUser(accessToken: string): Promise<Auth0User> {
		const userinfoEndpoint = this.appDomain + "/userinfo";
		const response = await fetch(userinfoEndpoint, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
		return await response.json();
	}

	public async refreshAccessToken(refreshToken: string): Promise<Auth0Tokens> {
		const result = await this.client.refreshAccessToken<TokenResponseBody>(refreshToken, {
			authenticateWith: "request_body",
			credentials: this.clientSecret
		});

		return {
			accessToken: result.access_token,
			refreshToken: result.refresh_token,
			idToken: result.id_token
		};
	}
}

interface TokenResponseBody {
	access_token: string;
	refresh_token: string;
	id_token: string;
}

export interface Auth0Tokens {
	accessToken: string;
	refreshToken: string;
	idToken: string;
}

export interface Auth0User {
	sub: string;
	name: string;
	picture: string;
	locale: string;
	updated_at: string;
	given_name?: string;
	family_name?: string;
	middle_name?: string;
	nickname?: string;
	preferred_username?: string;
	profile?: string;
	email?: string;
	email_verified?: boolean;
	gender?: string;
	birthdate?: string;
	zoneinfo?: string;
	phone_number?: string;
	phone_number_verified?: boolean;
}