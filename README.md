# fin-monitor-api

Serverless Framework **v4** GraphQL API on AWS Lambda:

- **Apollo Server** + **GraphQL**
- **Nexus** schema (code-first)
- **esbuild** bundling (built into Serverless v4)

## Prerequisites

- Node.js 20+
- AWS credentials configured for deploy

## Setup

```bash
npm install
# set database.url in orm.config.json if needed
npm run db:up
npm run migrate
```

## Verify bundle (no AWS required)

```bash
npm run build:check
```

## Deploy

```bash
npm run deploy
```

After deploy, POST to the printed HTTP API URL:

```graphql
query {
  categoryCollection(input: { limit: 500 }) {
    items {
      id
      title
      label
      metrics { amount share investedAmount investedValue }
    }
    meta { page total pages nextPage }
  }
}

mutation {
  categoryCreate(input: { title: "Stocks", label: "Investing Asset" }) {
    id
    title
    label
  }
}
```

Auth header: `Authorization: Bearer stub-token` (set `VITE_GRAPHQL_TOKEN=stub-token` in the front-end).

## Local API (serverless-offline)

```bash
npm run offline
```

GraphQL endpoint: `http://localhost:3000/graphql`

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer stub-token' \
  -d '{"query":"{ userCollection(input: {}) { items { id email name firstName lastName } meta { page total pages nextPage } } }"}'
```

All requests require auth via the `Authorization` header (`Bearer stub-token`), checked in the GraphQL handler context (same idea as reconciliation-backend’s shield, without per-resolver wrappers).

## Project layout

```
serverless.js           # root config entry (ESM)
serverless/
  index.js              # composes split config
  service.js            # service + frameworkVersion
  build.js              # v4 esbuild settings
  provider.js           # AWS provider
  functions.js          # Lambda functions + HTTP API events
  plugins.js            # serverless-offline
  custom.js             # offline options
  esbuild.config.js     # esbuild overrides (ESM, externals)
src/
  handlers/graphql.js   # Apollo Lambda handler
  models/               # postgresql-orm models (Category, Asset, *AssetLine, …)
  types/                # Nexus schema (one file per domain)
    category.js
    investment-asset.js
    operating-asset.js
    dual-purpose-asset.js
    shared.js
    user.js
    index.js            # makeSchema
  middleware/           # authenticateContext (stub header)
  resolvers/            # plain async resolvers (helpers live in each file)
    index.js            # barrel export
    category.js
    asset.js
    investment-asset.js
    operating-asset.js
    dual-purpose-asset.js
    user.js
  db/                   # postgresql-orm client
orm.config.json         # postgresql-orm database URL + models path
```
