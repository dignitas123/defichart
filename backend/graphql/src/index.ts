import express from "express";
import { ApolloServer, gql } from "apollo-server-express";

// Define your GraphQL schema
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Define your resolver functions
const resolvers = {
  Query: {
    hello: (): string => "Hello world!",
  },
};

// Initialize an ApolloServer instance with your schema and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Create an Express app and mount the ApolloServer instance on it
const app = express();

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });
}

startApolloServer().then(() => {
  app.listen(4000, '0.0.0.0', () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
  });
});
