import express from "express";
import { ApolloServer } from "apollo-server-express";
import { Resolvers } from "./generated/graphql";
import { getTimestreamRecords } from "./aws-module/get-data";
import { timestreamRecordsQuery } from "./timestream-query/queries";
import { typeDefs } from "./type-defs";
import { GraphQLError } from "graphql";

// Define your resolver functions
const resolvers: Resolvers = {
  Query: {
    records: async (_root, { timeFrame, binAmount }) => {
      if (binAmount > 200) {
        throw new GraphQLError(
          `Bin amount ${binAmount} is too high. It can\'t be higher than 200.`,
          {
            extensions: {
              code: "BAD_USER_INPUT",
            },
          }
        );
      }
      const timestreamRecords = await getTimestreamRecords(
        timestreamRecordsQuery(timeFrame, binAmount)
      );
      if (!timestreamRecords) {
        throw new GraphQLError(
          "Not able to query timesteam records from database. Try again later."
        );
      }
      return timestreamRecords;
    },
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
  app.listen(4000, "0.0.0.0", () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
  });
});
