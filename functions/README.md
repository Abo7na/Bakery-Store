# Admin authentication

This Pages Functions layer protects every request under `/admin` and `/api/admin`.
The public storefront and `/admin-login.html` remain accessible without a session.

## Required Cloudflare Pages secrets

In the Pages project, open **Settings → Variables and Secrets → Production** and add:

- `ADMIN_PASSWORD`: a unique password of at least 16 characters.
- `SESSION_SECRET`: a randomly generated secret of at least 32 characters.

Add both as encrypted secrets (not plain-text variables). Repeat for Preview only if preview deployments should have admin access. Never commit either value to GitHub or put them in frontend JavaScript.

After setting both secrets, deploy the project. The login creates an eight-hour HMAC-signed session cookie marked HttpOnly, Secure, and SameSite=Strict. The logout action expires that cookie.

The Pages Functions invocation routes are limited by the root `_routes.json` to `/admin`, `/admin/*`, and `/api/admin/*`; public storefront routes are excluded. In Cloudflare Pages, also set **Settings → Runtime → Fail open / closed → Fail closed** so an exhausted Functions allowance cannot silently fall back to serving protected static admin files.

This protects access to the static admin pages. It does **not** replace a server-side data API or shared database: the current business data still lives in browser localStorage. Do not treat this version as ready for multi-device or real-money production operations.
