## endpoints

HTTP: http://localhost:4466/companies-node/dev
WS: ws://localhost:4466/companies-node/dev

## authorization

```json
{
  "Authorization":
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJjb21wYW5pZXMtbm9kZUBkZXYiLCJyb2xlcyI6WyJhZG1pbiJdfSwiaWF0IjoxNTE3ODQ0NzkwLCJleHAiOjE1MTg0NDk1OTB9.OPKBggQwxEl55BfNkFR3Z4lcKNAaELMbQ9-PoWPVOZ0"
}
```

## Documentation

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
