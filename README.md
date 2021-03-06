## endpoints

HTTP: http://localhost:4466/companies-node/dev
WS: ws://localhost:4466/companies-node/dev

For local dev use http://localhost:4000

## authorization

```json
{
  "Authorization":
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJjb21wYW5pZXMtbm9kZUBkZXYiLCJyb2xlcyI6WyJhZG1pbiJdfSwiaWF0IjoxNTE3ODQ0NzkwLCJleHAiOjE1MTg0NDk1OTB9.OPKBggQwxEl55BfNkFR3Z4lcKNAaELMbQ9-PoWPVOZ0"
}
```

## import data

run `prisma import -d data.zip` where data.zip is path to data.

## prisma token

run: `prisma token`
output:

```sh
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJoYWNrZXJuZXdzLWdyYXBocWwtanNAZGV2Iiwicm9sZXMiOlsiYWRtaW4iXX0sImlhdCI6MTUxNzg0MjM5NiwiZXhwIjoxNTE4NDQ3MTk2fQ.QK8B2VztgENDpBNlSGi0OfMQRqwi_skXyX1COp-vyUY
```

## Documentation

## Queries

* all companies feed

```gql
{
  feed {
    description
    url
    name
    tranch
    id
  }
}
```

* filtered

```gql
  feed(filter: "Attestation") {
    description
    url
  }
```

* filtered with id

* modify schema.graphql feed query by adding arg `id` of type `ID`

```graphql
type Query {
  feed(filter: String, skip: Int, first: Int, id: ID): [Company!]!
}
```

* then add the params to the `feed` resolver in `resolvers/Query.js`

```js
function feed(parent, args, context, info) {
  const { filter, first, skip } = args; // destructure input arguments
  const where = filter
    ? {
        OR: [
          { url_contains: filter },
          { description_contains: filter },
          { name_contains: filter },
          { id: filter } //here
        ]
      }
    : {};

  return context.db.query.companies({ first, skip, where }, info);
}
```

## create post(new link/company)

* in app section of playground run:

```gql
mutation {
  post(
    name: "TestPost"
    url: "https://www.howtographql.com"
    description: "Fullstack tutorial website for GraphQL"
  ) {
    id
  }
}
```

## signup/login mutations

* add following to schema.graphql

```gql
type Mutation {
  post(url: String!, description: String!): Link!
  signup(email: String!, password: String!, name: String!): AuthPayload
}

#and

type AuthPayload {
  token: String
  user: User
}
```

* add to datamodel.graphql

```gql
type User {
  id: ID! @unique
  name: String!
  email: String! @unique
  password: String!
}
```

* run `primsa deploy` to effect schema changes.

- edit schema.graphql to limit client query so cant see pass w

```gql
type User {
  id: ID!
  name: String!
  email: String!
}
```

* signup mutation resolver to resolver script

```js
async function signup(parent, args, context, info) {
  const password = await bcrypt.hash(args.password, 10);
  const user = await context.db.mutation.createUser({
    data: { ...args, password }
  });

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user
  };
}
```

* test query

- in app default playground run:

```gql
mutation {
  signup(email: "johndoe@graph.cool", password: "graphql", name: "John") {
    token
    user {
      id
    }
  }
}
```

* output:

```json
{
  "data": {
    "signup": {
      "token":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjamRhbzVuNmkwMGtzMDEwN2F2NGg2dzBtIiwiaWF0IjoxNTE3ODYyNTIzfQ.zqL7vfOkZY9kKbElqxDZ7jXEMVOBnYnaaEpLQB6sRbk",
      "user": {
        "id": "cjdao5n6i00ks0107av4h6w0m"
      }
    }
  }
}
```

## Login Mutation

1. Open src/schema.graphql and adjust the Mutation type so it looks as follows:

```js
type Mutation {
  post(url: String!, description: String!): Company!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
}
```

2. Next, you need to implement the resolver for this field.

* Open src/resolvers/Mutation.js and add the following function to it:

```js
async function login(parent, args, context, info) {
  const user = await context.db.query.user({ where: { email: args.email } });
  if (!user) {
    throw new Error(`Could not find user with email: ${args.email}`);
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
    login
  };
}
```

3. Export query mutation from schema.graphql

```gql
type Mutation {
  post(url: String!, description: String!): Company!
  signup(email: String!, password: String!, name: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
}
```

4. Export the function from Mutation.js

```js
module.exports = {
  post,
  signup,
  login
};
```

4. Test in GraphiQL

* run test mutation:

```gql
mutation {
  login(email: "johndoe@graph.cool", password: "graphql") {
    token
  }
}
```

* output:

```json
{
  "data": {
    "login": {
      "token":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjamRhbzVuNmkwMGtzMDEwN2F2NGg2dzBtIiwiaWF0IjoxNTE3ODYzMTUyfQ.Zv_tY4Y-b4Pch69ItSryfx9u7pbDUzNgVIMaqDCDDe4"
    }
  }
}
```

### Commands

* `yarn start` starts GraphQL server on `http://localhost:4000`
* `yarn dev` starts GraphQL server on `http://localhost:4000` _and_ opens GraphQL Playground
* `yarn playground` opens the GraphQL Playground for the `projects` from [`.graphqlconfig.yml`](./.graphqlconfig.yml)
* `yarn prisma <subcommand>` gives access to local version of Prisma CLI (e.g. `yarn prisma deploy`)

> **Note**: We recommend that you're using `yarn dev` during development as it will give you access to the GraphQL API or your server (defined by the [application schema](./src/schema.graphql)) as well as to the Prisma API directly (defined by the [Prisma database schema](./generated/prisma.graphql)). If you're starting the server with `yarn start`, you'll only be able to access the API of the application schema.

### Project structure

![](https://imgur.com/95faUsa.png)

| File name 　　　　　　　　　　　　　　 | Description 　　　　　　　　<br><br>                                                                                                                           |
| :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `├── .graphqlconfig.yml`               | Configuration file based on [`graphql-config`](https://github.com/prisma/graphql-config) (e.g. used by GraphQL Playground).                                    |
| `└── database` (_directory_)           | _Contains all files that are related to the Prisma database service_                                                                                           | \  |
| `├── prisma.yml`                       | The root configuration file for your Prisma database service ([docs](https://www.prismagraphql.com/docs/reference/prisma.yml/overview-and-example-foatho8aip)) |
| `└── datamodel.graphql`                | Defines your data model (written in [GraphQL SDL](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51))                                |
| `└── src` (_directory_)                | _Contains the source files for your GraphQL server_                                                                                                            |
| `├── index.js`                         | The entry point for your GraphQL server                                                                                                                        |
| `├── schema.graphql`                   | The **application schema** defining the API exposed to client applications                                                                                     |
| `└── generated` (_directory_)          | _Contains generated files_                                                                                                                                     |
| `└── prisma.grapghql`                  | The **Prisma database schema** defining the Prisma GraphQL API                                                                                                 |

## Contributing

The GraphQL boilerplates are maintained by the GraphQL community, with official support from the [Apollo](https://dev-blog.apollodata.com) & [Graphcool](https://blog.graph.cool/) teams.

Your feedback is **very helpful**, please share your opinion and thoughts! If you have any questions or want to contribute yourself, join the [`#graphql-boilerplate`](https://graphcool.slack.com/messages/graphql-boilerplate) channel on our [Slack](https://graphcool.slack.com/).
