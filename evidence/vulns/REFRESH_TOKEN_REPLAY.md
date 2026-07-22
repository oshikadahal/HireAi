# Vulnerability: Refresh Token Replay / Rotation Missing — `POST /api/auth/refresh`

**Category:** Authentication / Session Management

**CVSS v3.1:** 7.0 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N) — Example score; adjust after testing.

## Technical summary

Refresh tokens were stored and accepted without enforced rotation or one-time usage. An attacker who obtains a refresh token (e.g., via XSS, stolen device, or logs) can replay it to obtain new access tokens. Without rotation and binding, the old refresh token remains valid and can be reused to issue multiple access tokens, enabling session hijacking.

## Affected component

- Endpoint: `POST /api/auth/refresh`
- Server files: `server/controllers/authController.js`, `server/middleware/sessionBinding.js` (optional)

## Impact

A stolen refresh token allows prolonged unauthorized access and session hijack. This can be used to exfiltrate candidate data or escalate actions where the token owner has privileges.

## Reproduction steps (lab)

1. Authenticate and capture the `refreshToken` cookie value for `victimUser`.
2. Using the stolen cookie, send `POST /api/auth/refresh` to exchange for a new access token.
3. If the server does not invalidate the old refresh token and rotate it, the attacker can repeat step 2 indefinitely until expiration.

Example payload (see `evidence/payloads/session-replay.txt`):

```
POST /api/auth/session HTTP/1.1
Host: localhost:5000
Cookie: refreshToken=<old-refresh-token>
```

## Proof (evidence)

- Payload: `evidence/payloads/session-replay.txt`
- Screenshots: `evidence/screenshots/refresh-before.png`, `evidence/screenshots/refresh-after.png`

## Root cause

Server accepts refresh tokens without rotation and does not maintain single-use state or associate tokens with device fingerprints. Missing token revocation and rotation enable replay attacks.

## Remediation

- Implement refresh token rotation: issue a new refresh token on every refresh and invalidate the previous token.
- Persist refresh tokens server-side (or store revocation list) with an identifier and expiration.
- Bind refresh tokens to device fingerprints where feasible and revoke tokens on logout or suspicious activity.

Example pseudocode for rotation:

```js
// On refresh request
const oldToken = req.cookies.refreshToken;
const stored = await RefreshToken.findOne({ tokenId: oldToken.id });
if (!stored || stored.revoked) return res.status(401);
// Issue new refresh token
const newToken = createRefreshToken(userId, deviceId);
// Mark old as rotated/revoked
stored.revoked = true;
stored.replacedBy = newToken.id;
await stored.save();
// Persist new token
await RefreshToken.create({ tokenId: newToken.id, userId, deviceId });
res.cookie('refreshToken', newToken.cookieValue, { httpOnly: true, secure: true, sameSite: 'Strict' });
```

## Retest evidence

- After rotation is implemented, attempting to reuse the old refresh token should return 401 Unauthorized.
- Add screenshot `evidence/screenshots/refresh-after.png` showing 401 for old token and successful issuance for the new token.

## Notes & mitigations

- Consider short-lived access tokens + rotation for refresh tokens.
- Monitor anomaly events (multiple refreshes from different IPs/devices) and alert.
