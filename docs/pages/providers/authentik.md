---
title: "Authentik"
---

# Okta

OAuth 2.0 provider for Authentik.

Also see the [OAuth 2.0](/guides/oauth2) guide.

## Initialization

The `domain` parameter should not include the protocol or path.

```ts
import { Authentik } from "arctic";

const domain = "auth.example.com";
const authentik = new Authentik(domain, clientId, clientSecret, redirectURI);
```

## Create authorization URL

Use `setScopes()` and `appendScopes()` to define scopes.

```ts
import { generateState, generateCodeVerifier } from "arctic";

const state = generateState();
const codeVerifier = generateCodeVerifier();
const url = authentik.createAuthorizationURL(state, codeVerifier);
url.setScopes("openid", "profile");
```

## Validate authorization code

`validateAuthorizationCode()` will either return an [`OAuth2Tokens`](/reference/OAuth2Tokens), or throw one of [`OAuth2RequestError`](/reference/OAuth2RequestError), [`ArcticFetchError`](/reference/ArcticFetchError), or a standard `Error` (parse errors). Actual values returned by Authentik depends on your configuration and version.

```ts
import { OAuth2RequestError, ArcticFetchError } from "arctic";

try {
	const tokens = await authentik.validateAuthorizationCode(code, codeVerifier);
	const accessToken = tokens.accessToken();
	const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
	const refreshToken = tokens.refreshToken();
} catch (e) {
	if (e instanceof OAuth2RequestError) {
		// Invalid authorization code, credentials, or redirect URI
		const code = e.code;
		// ...
	}
	if (e instanceof ArcticFetchError) {
		// Failed to call `fetch()`
		const cause = e.cause;
		// ...
	}
	// Parse error
}
```

## Refresh access tokens

Use `refreshAccessToken()` to get a new access token using a refresh token. This method also returns `OAuth2Tokens` and throws the same errors as `validateAuthorizationCode()`.

```ts
import { OAuth2RequestError, ArcticFetchError } from "arctic";

try {
	const tokens = await authentik.refreshAccessToken(accessToken);
} catch (e) {
	if (e instanceof OAuth2RequestError) {
		// Invalid authorization code, credentials, or redirect URI
	}
	if (e instanceof ArcticFetchError) {
		// Failed to call `fetch()`
	}
	// Parse error
}
```

## Revoke tokens

Use `revokeToken()` to revoke a token. This can throw the same errors as `validateAuthorizationCode()`.

```ts
try {
	await authentik.revokeToken(token);
} catch (e) {
	if (e instanceof OAuth2RequestError) {
		// Invalid authorization code, credentials, or redirect URI
	}
	if (e instanceof ArcticFetchError) {
		// Failed to call `fetch()`
	}
	// Parse error
}
```