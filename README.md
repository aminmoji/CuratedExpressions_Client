# Curated Expressions

A full-stack art marketplace for independent artists. Visitors can browse a
public collection, while verified artists can create a profile, publish work,
upload images, and manage their listings.

## Stack

- Next.js App Router through Vinext
- Cloudflare Workers and Workers Assets
- Cloudflare D1 for artwork and artist profiles
- Cloudflare R2 for uploaded artwork images
- Firebase Authentication with email verification and Google sign-in
- Drizzle ORM

## Local development

```bash
npm ci
cp .dev.vars.example .dev.vars
npm run dev
```

Fill in the Firebase web configuration in `.dev.vars`. Local D1 and R2 data is
simulated by Wrangler.

## Validation

```bash
npm run lint
npm test
npm run deploy:check
```

## Deployment

The production Worker is connected to this repository with Cloudflare Workers
Builds. Pushes to the production branch build and deploy automatically.

Build command: `npm run build`

Deploy command: `npm run deploy`

Wrangler automatically provisions the D1 and R2 bindings on the first deploy.
The deploy script also applies pending D1 migrations.
