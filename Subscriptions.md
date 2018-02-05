---
title: Subscriptions
pageTitle: "GraphQL Realtime Subscriptions with JavaScript Tutorial"
description: "Learn how to implement server-side GraphQL subscriptions with grahpql-js, Node.js, Express & MongoDB to add realtime functionality to an app."
question: Which of the following is true?
answers: [ "It's not currently possible to test subscriptions via GraphiQL", "Subscriptions can be implemented via web sockets"]
correctAnswer: 2
---

In this section, you'll learn how you can bring realtime functionality into your app by implementing GraphQL subscriptions. Recalling our initial requiements, the goal is to implement two subscriptions:

* Send realtime updates to subscribed clients when a new company element is _created_
* Send realtime updates to subscribed clients when an existing company element is _upvoted_

### What are GraphQL subscriptions?

Subscriptions are a GraphQL feature that allows the server to send data to the clients when a specific event happens. Subscriptions are usually implemented with [WebSockets](https://en.wikipedia.org/wiki/WebSocket), where the server holds a steady connection to the client. This means you're not using the _Request-Response-Cycle_ that we used for all previous interactions with the API any more. Instead, the client initially opens up a steady connection to the server by specifying which event it is interested in. Every time this particular event happens, the server uses the connection to push the data that's related to the event to the client.

### Subscriptions with Prisma

Luckily for us, Prisma comes with out-of-the-box support for subscriptions. In fact, if you take a look at the Prisma schema in `src/generated/prisma.graphql`, you'll notice that the `Subscription` type is already there and looks as follows:

```graphql(path=".../companies-node/src/generated/prisma.graphql"&nocopy)
type Subscription {
  vote(where: VoteSubscriptionWhereInput): VoteSubscriptionPayload
  company(where: CompanySubscriptionWhereInput): CompanySubscriptionPayload
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}
```

These subscriptions can fire for the following _events_:

* A new node is **created**
* An existing node **updated**
* An existing node is **deleted**

Notice that you can constrain for which events exactly should fire. For example, if you only want to subscribe to update to one specific `Company` or when a specific `User` is deleted, you can do so as well by providing the `where` argument to the subscription.

GraphQL subscriptions follow the same syntax as queries and mutations, so you could for example subscribe to _events_ of existing `Company` elements being updated with the following subscription:

```graphql(nocopy)
subscription {
  company(where: {
    mutation_in: [UPDATED]
  }) {
    node {
      id
      url
      description
    }
  }
}
```

This subscription would fire everytime an existing `Company` is updated and the server would send along the (potentially updated) `url` and `description` values for the updated `Company`.

### Implementing GraphQL subscriptions

To implement subscriptions for your GraphQL API, you follow the same process of adding queries and mutations. First add them to your application schema, then implement the corresponding resolvers.

<Instruction>

Open your application schema in `src/schema.grahpql` and add the `Subscription` type to it:

```path=".../companies-node/src/schema.graphql"
type Subscription {
  newCompany: CompanySubscriptionPayload
  newVote: VoteSubscriptionPayload
}
```

</Instruction>

You now have the same issue as you had with `Vote` in the last chapter: You're referencing types, `CompanySubscriptionPayload` and `VoteSubscriptionPayload`, in the application schema without making them explicitly available (either by importing or redefining them). The solution of course is to import them from the Prisma schema.

<Instruction>

Still in `src/schema.graphql`, adjust the import statement to also import `CompanySubscriptionPayload` and `VoteSubscriptionPayload`:

```graphql(path=".../companies-node/src/schema.graphql")
# import Company, Vote, CompanySubscriptionPayload, VoteSubscriptionPayload from './generated/prisma.graphql'
```

</Instruction>

Awesome! The next step for you implementing the resolvers for both subscriptions.

<Instruction>

In `src/resolvers`, create a new file called `Subscription.js`. Then add the following code to it:

```js(path=".../companies-node/src/resolvers/Subscription.js")
const newCompany = {
  subscribe: (parent, args, ctx, info) => {
    return ctx.db.subscription.company(
      { },
      info,
    )
  },
}

const newVote = {
  subscribe: (parent, args, ctx, info) => {
    return ctx.db.subscription.vote(
      { },
      info,
    )
  },
}

module.exports = {
  newCompany,
  newVote,
}
```

### Note:

Subscriptions with 'where' filter do not currently work! For example the following code does not work:

```
const newVote = {
  subscribe: (parent, args, ctx, info) => {
    return ctx.db.subscription.vote(
      { where: { mutation_in: ['CREATED'] } },
      info,
    )
  },
}
```

</Instruction>

Subscription resolvers are implemented slightly differently than those for queries and mutations. Rather than directly writing the resolver function function, you define an object with a `subscribe` property. The value of this property is the actual subscription resolver.

Just like with queries and mutations though, and thanks to the `prisma-binding` package, all you need to do to actually implement the resolver functions is _delegate_ the subscription execution to the `Prisma` instance you create in `index.js`.

Talking about `index.js`, the last thing you need to do to make subscriptions work is adding the resolvers to the `resolvers` object which gets passed to the constructor of your `GraphQLServer`.

<Instruction>

Open `src/index.js`, add the import statement for `Subscription` and include it in the `resolvers` object:

```js{5,10}(path=".../companies-node/src/index.js")
const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const Subscription = require('./resolvers/Subscription')

const resolvers = {
  Query,
  Mutation,
  Subscription
}
```

</Instruction>

That's it! You can now test subscriptions inside your Playground!️ ⚡️

### Testing GraphQL subscriptions

Just like queries and mutations, you can test subscriptions inside a GraphQL Playground.

<Instruction>

Start your server by running the following command in your root directory:

```bash(path=".../companies-node")
yarn start
```

</Instruction>

<Instruction>

Then navigate to [`http://localhost:4000`](http://localhost:4000) in your browser and send the following subscription:

```graphql
subscription {
  newCompany {
    node {
      description
      url
      postedBy {
        email
      }
    }
  }
}
```

</Instruction>

Rather than having the results displayed right away (as you're used to from queries and mutations), you're now waiting for the event to happen which will then push the requested event data (`id`, `url` and `description` of the new `Company`) to the Playground.

To test the subscription, you can open a new tab in the Playground (or a Playground in an entirely new window) and send the `post` mutation which creates a new `Company` element on behalf of an authenticated `User`:

![](https://imgur.com/O5j9J8T.gif)
