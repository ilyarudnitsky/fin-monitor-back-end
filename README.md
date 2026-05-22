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
  userCollection(input: {}) {
    items { id email name firstName lastName }
  }
  user(input: { id: "00000000-0000-4000-8000-000000000001" }) {
    name
    firstName
    lastName
  }
}

mutation {
  userCreate(input: { email: "alice@example.com", name: "Alice" }) {
    id
    email
  }
  userUpdate(input: { id: "...", firstName: "Alice", lastName: "Updated" }) {
    id
    firstName
    lastName
  }
  userDelete(input: { id: "..." }) { id }
}
```

## Local API (serverless-offline)

```bash
npm run offline
```

GraphQL endpoint: `http://localhost:3000/graphql`

```bash
curl -s -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer stub-token' \
  -d '{"query":"{ userCollection(input: {}) { items { id email name firstName lastName } } }"}'
```

All resolvers require stub auth via the `Authorization` header (`Bearer stub-token`).

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
  models/User.json      # postgresql-orm model
  types/                # Nexus schema (one file per model)
    user.js             # User types, inputs, query/mutation fields
    index.js            # makeSchema
  middleware/           # auth (stub header) + logging
  resolvers/            # resolve functions (one file per model)
    user.js
  db/                   # postgresql-orm client
orm.config.json         # postgresql-orm database URL + models path
```
