# Cloudflare setup for Bakery Store

## Pages Functions bindings
In Cloudflare Dashboard open Workers & Pages -> Bakery Store -> Settings -> Functions -> Bindings.

Add:
- D1 database binding: variable name `DB`, select the database you create for this shop.
- R2 bucket binding: variable name `IMAGES`, select the bucket you create for product photos.

Save and redeploy the Pages project after adding bindings.

## Create the D1 database
Create a D1 database named `bakery-store-db`. Apply `migrations/0001_initial.sql` once using the D1 Console, or from Wrangler:
`npx wrangler d1 execute bakery-store-db --remote --file=migrations/0001_initial.sql`

## Create the R2 bucket
Create a private R2 bucket named `bakery-store-images`. Keep public access disabled: images are delivered through the Pages Function route `/api/images/<key>`, which reads from the private R2 binding and sets cache headers. This lets the site use its Pages hostname without requiring a separate custom domain at first.

## Set secrets
In Pages -> Settings -> Variables and Secrets, add these as encrypted secrets:
- `ADMIN_PASSWORD`: choose a long, unique admin password.
- `SESSION_SECRET`: generate a random secret of at least 32 characters.

Do not put either secret in GitHub or in frontend JavaScript.

## Notes
The API endpoints are in `functions/api/[[path]].js`. Pages Functions need a redeployment after bindings or secrets change.
