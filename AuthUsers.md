---
title: Setting up Authenticated Users
pageTitle: "Server-side Authentication with Prisma, GraphQL, Javascript & Node.js Tutorial"
description: "Learn best practices for implementing email-password authentication on a GraphQL Server with Javascript, Node.js & Express."
question: What is the "connect" argument in a Prisma mutation used for?
answers: ["It's used to connect two nodes in the database via a relation", ]
correctAnswer: 3
---

## Setting up Authenticated Users

Both`signup` and `login` mutations return authentication token for your users. In this section, you'll learn how you can _use_ authentication tokens to associate an incoming request with a user of your application.

### Creating a relation between `User` and `Company`

Looking back at the requirements from the "Getting Started"-section, we actually stated that only _authenticated_ users should be able to create new `Company` elements. However, right now, the `post` mutation is available for everyone - so you should change that to properly account for that requirement!

### Steps

1. Create Relations btwn User and Company types.
2. Apply changes with `prisma deploy`.
3. Adjust post resolver so new mutation data is written to correct place in the database.

The first thing to do is update the data model again! You want to create a relationship between the `User` and the `Company` type which expresses that one `User` can _post_ many `Company`s.

<Instruction>

Open `database/datamodel.graphql` and adjust the `User` and `Company` types as follows:

```graphql{5,13}(path=".../companies-node/database/datamodel.graphql")
type Company {
  id: ID! @unique
  description: String!
  url: String!
  postedBy: User
}

type User {
  id: ID! @unique
  name: String!
  email: String! @unique
  password: String!
  companies: [Company!]!
}
```

</Instruction>

To apply these changes, you need to deploy the Prisma database service again.

<Instruction>

In the root directory of your project, run the following command:

```bash(path=".../companies-node")
yarn prisma deploy
```

</Instruction>

All right! With these changes, you express that a `Company` node can be associated with a `User` node via the `postedBy` and `companies` fields. However, you also need to make sure that this data is properly entered into the database when a `post` mutation is received, so you need to adjust the `post` resolver!

### Adjusting the `post` resolver

If you're taking a look at the Prisma schema (in `src/generated/prisma.graphql`), in particular the `createCompany` mutation, you'll notice that the `CompanyCreateInput` (the type that wraps all input arguments for this mutation) now has an additional field:

```graphql(nocopy)
input CompanyCreateInput {
  description: String!
  url: String!
  postedBy: UserCreateOneWithoutCompaniesInput
}
```

Without going in too much detail about the generated types here, this basically means that when creating a new `Company` node using the `createCompany` mutation, you can now directly provide the `id` (or even the `email` because that's also a `@unique` field) of a specific `User` to express that the new `Company` was `postedBy` that `User`.

Consider for example the following mutation:

```graphql(nocopy)
mutation {
  createCompany(data: {
    url: "https://www.graphql.org",
    description: "Official GraphQL Website",
    postedBy: {
      connect: {
        email: "johndoe@graph.cool"
      }
    }
  }) {
    id
  }
}
```

This mutation not only creates a new `Company` node, but it also sets the `postedBy` field of that new `Company` to the `User` who is identified by the email `johndoe@graph.cool`. As mentioned above, you can use both the `id` and the `email` field to uniquely identify a `User`.

Note that this mutation will fail if no `User` with the provided `email` exists - in that case, no `Company` element will be created either!

Now it's time to actually make the required changes to your code.

<Instruction>

Open `src/resolvers/Mutation.js` and adjust the `post` resolver so it looks as follows:

`connect` connects two nodes in the database via a relation.

```js{2-4}(path=".../companies-node/src/resolvers/Mutation.js)
function post(parent, { url, description }, context, info) {
  const userId = getUserId(context)
  return context.db.mutation.createCompany(
    { data: { url, description, postedBy: { connect: { id: userId } } } },
    info,
  )
}
```

</Instruction>

The difference to the previous version is that this time you're first retrieving the user's `id` from the context (you'll implement `getUserId` in just a bit) and then pass it to the `createCompany`-mutation as a value for the `connect` argument - just like in the sample mutation from above. `connect` connects two nodes in the database via a relation.

To make this work, you still need a function called `getUserId` that's able to retrieve the `id` of a `User` from the `context` that's passed down the resolver chain.

<Instruction>

Open `src/utils.js` and add the following function to it:

```js(path=".../companies-node/src/utils.js)
function getUserId(context) {
  const Authorization = context.request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { userId } = jwt.verify(token, APP_SECRET)
    return userId
  }

  throw new Error('Not authenticated')
}
```

</Instruction>

The `context` argument has a `request` property representing the incoming HTTP request which carries the query or mutation. Consequently, the `request` property provides access to the headers of the incoming HTTP request. As authentication tokens are expected to be carried in the `Authorization` header field, you can retrieve the value of that field with `context.request.get('Authorization')`.

Additionally, the actual authentication token is prepended with the following string `"Bearer "`, so in order to access the raw token you need to get rid of that prefix. Once the `token` was retrieved, it can be verified using the `jsonwebtoken` library. Note that [`jwt.verify`](https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback) returns a JSON object with the encoded payload (or throws an error in case the token is not valid). Since the payload contains the `id` of the `User` the token was issued for, you now finally have access to a valid `id` of an authenticated `User`.

Finally, to make this work there are two small things left to. First, you need to import `jwt` as it's used inside the `getUserId` function, then of course make sure the function gets exported.

<Instruction>

Still in `src/utils.js`, add the following import statement to the very top of the file: `const jwt = require('jsonwebtoken')`. Then, adjust the export statement to now also include the `getUserId` function:

```{3}js(path=".../companies-node/src/utils.js)
module.exports = {
  APP_SECRET,
  getUserId,
}
```

</Instruction>

Fantastic! Let's go and test if the `post` mutation now actually works when creating a new `Company` on behalf of an authenticated `User`.

### Authenticating a `User`

We already discussed how you can obtain an authentication token for a given `User` of your application but we haven' yet talked about how you can _use_ them in order to make authenticated requests on behalf of a specific `User`.

Here is how it works:

1. In the Playground, send the `signup` or `login` mutation to obtain an authentication `token` from your GraphQL server
1. Set the token as the `Authorization` header in the Playground
1. Send a `post` mutation to create a new `Company` element

Let's go through these steps together!

<Instruction>

Start the server from the root directory of your project:

```bash(path=".../companies-node)
yarn start
```

</Instruction>

<Instruction>

Now open [`http://localhost:4000`](http://localhost:4000) in your browser to access your `app` GraphQL API again. Send the `login` mutation for a `User` you previously created (or use the `signup` mutation to create an entirely new `User`):

```graphql
mutation {
  login(email: "johndoe@graph.cool", password: "graphql") {
    token
  }
}
```

</Instruction>

![](https://imgur.com/POYCgHC.png)

<Instruction>

Now, copy the `token` from the JSON response of the server and use it to replace the `__TOKEN__` placeholder in the following HTTP header. This header needs to be put into the **HTTP HEADERS** pane in the bottom-left corner of the Playground:

```json
{
  "Authorization":
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjamRhbzVuNmkwMGtzMDEwN2F2NGg2dzBtIiwiaWF0IjoxNTE3ODY1Njc5fQ.JvmZ9IXPG0-VGVUXcrWQ6FbI4BGIjeQzs1-kvB4N_x8"
}
```

</Instruction>

![](https://imgur.com/RsTfhv0.png)

<Instruction>

With the HTTP `Authorization` header in place, you can now send the following mutation in the Playground:

```graphql
mutation {
  post(
    url: "https://www.graphqlweekly.com"
    description: "Weekly GraphQL Newsletter"
  ) {
    id
  }
}
```

</Instruction>

To verify that everything worked and the new `Company` was indeed `postedBy` the `User` who the token belongs to, you can send the `feed` query like so:

```graphql
{
  feed {
    description
    postedBy {
      email
    }
  }
}
```

If everything worked correctly, the `feed` query now returns this item as part of the list:

```json(nocopy)
{
  "description": "Weekly GraphQL Newsletter",
  "postedBy": {
    "email": "johndoe@graph.cool"
  }
}
```

### Adding a `vote` mutation

The last feature you'll implement in this section is a `vote` mutation, allowing authenticated `User`s to cast a vote for a specific `Company`.

Recall the steps for creating adding a new feature to your GraphQL API:

1. Adjust data model (if necessary)
1. Deploy Prisma database service to apply changes to data model (if necessary)
1. Add new root field (on the `Query`, `Mutation` or `Subscription` field) to application schema
1. Implement the resolver for the new root field

In this case, you need to start with adjusting the data model, since right now it doesn't allow for a voting feature.

<Instruction>

Open `database/datamodel.graphql`, add a new `Vote` type and adjust the `User` and `Link` types to have a relation to `Vote`:

```graphql{1-5,12,21}(path=".../companies-node/database/datamodel.graphql")
type Vote {
  id: ID! @unique
  link: Link!
  user: User!
}

type Link {
  id: ID! @unique
  description: String!
  url: String!
  postedBy: User
  votes: [Vote!]!
}

type User {
  id: ID! @unique
  name: String!
  email: String! @unique
  password: String!
  links: [Link!]!
  votes: [Vote!]!
}
```

</Instruction>

To make sure the Prisma database service is aware of these changes, you need to deploy them.

<Instruction>

In the root directory of your project, run the following command:

```bash(path=".../companies-node")
yarn prisma deploy
```

</Instruction>

The new type is now added and CRUD operations for `Vote` have been added to the Prisma schema (you can check `src/generated/prisma.graphql` to convince yourself of that).

The next step is to add the root field for the voting mutation.

<Instruction>

Open your application schema in `src/schema.graphql` and adjust the `Mutation` type like so:

```graphql{5}(path=".../companies-node/src/schema.graphql")
type Mutation {
  post(url: String!, description: String!): Link
  signup(name: String!, email: String!, password: String!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  vote(linkId: ID!): Vote
}
```

</Instruction>

Since you're now referencing the `Vote` type in the application schema without defining or importing it, the server won't work. So go ahead and import the `Vote` type into from the Prisma schema into your application schema.

<Instruction>

Still in `src/schema.graphql`, adjust the import statement to also import `Vote`:

```graphql(path=".../companies-node/src/schema.graphql")
# import Link, Vote from "./generated/prisma.graphql"
```

</Instruction>

Finally, you need to implement the `vote` resolver.

<Instruction>

Open `src/resolvers/Mutation.js` and add the following function to it:

```js(path=".../companies-node/src/resolvers/Mutation.js")
async function vote(parent, args, context, info) {
  const userId = getUserId(context)
  const { linkId } = args
  const linkExists = await context.db.exists.Vote({
    user: { id: userId },
    link: { id: linkId },
  })
  if (linkExists) {
    throw new Error(`Already voted for link: ${linkId}`)
  }

  return context.db.mutation.createVote(
    {
      data: {
        user: { connect: { id: userId } },
        link: { connect: { id: linkId } },
      },
    },
    info,
  )
}
```

</Instruction>

In the `vote` resolver, you're first retrieving the `userId` from the HTTP header again (using the familiar `getUserId` function you just implemented) so you can create the `Vote` on behalf of an actual `User`. What follows is a check to ensure the `Link` to be voted for actually exists. Lastly, the resolver invokes the `createVote` mutation from the Prisma API to create a new `Vote` in the database connecting the given `User` and `Link` nodes.

That's it! You can now restart the server and send the `vote` mutation in your `app` Playground.
