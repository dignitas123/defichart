import express from "express";
import { ApolloServer } from "@apollo/server";
import { Resolvers, TickDataResult } from "./generated/graphql";
import { getTimestreamRecords } from "./aws-module/get-data";
import { timeFrameBinQuery, timeFrameQuery } from "./timestream-query/queries";
import { typeDefs } from "./type-defs";
import { GraphQLError } from "graphql";
import { messageConsumer } from "./kinesis-shard/quotes";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import bodyParser from "body-parser";
import cors from "cors";
import { SYMBOL_BROKER_LIST } from "./broker-symbol-const";
import { getCurrentCandleDataForTF, getObjectOnS3 } from "./aws-module/s3-fns";
import { allowedOrigins } from "./allowed";

// Define your resolver functions
const resolvers: Resolvers = {
  Query: {
    binRecords: async (_root, { timeFrame, symbol, binAmount }) => {
      if (!SYMBOL_BROKER_LIST.includes(symbol)) {
        throw new GraphQLError(`Symbol ${symbol} is not allowed.`, {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
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
        timeFrameBinQuery(timeFrame, symbol, binAmount)
      );
      if (!timestreamRecords) {
        throw new GraphQLError(
          "Not able to query timesteam records from database. Try again later."
        );
      }
      return timestreamRecords;
    },
    timeFrameRecords: async (_root, { timeFrame, symbol, binAmount }) => {
      if (!SYMBOL_BROKER_LIST.includes(symbol)) {
        throw new GraphQLError(`Symbol ${symbol} is not allowed.`, {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
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
        timeFrameQuery(timeFrame, symbol, binAmount)
      );
      if (!timestreamRecords) {
        throw new GraphQLError(
          "Not able to query timesteam records from database. Try again later."
        );
      }
      const currentCandleData = await getObjectOnS3(`${symbol}-cp`);
      const currentCandle = getCurrentCandleDataForTF(
        currentCandleData,
        timeFrame
      );
      const currentRecord = [
        {
          timestamp: currentCandle.timestamp,
          open: currentCandle.open,
          high: currentCandle.high,
          low: currentCandle.low,
          close: currentCandleData.close,
          volume: currentCandle.volume,
        },
      ];
      return [...currentRecord, ...timestreamRecords];
    },
  },
  Subscription: {
    tickData: {
      subscribe: messageConsumer,
      resolve: (payload: TickDataResult) => payload,
    },
  },
};

// Create an Express app and mount the ApolloServer instance on it
const app = express();
const httpServer = createServer(app);

import { Request, Response, NextFunction } from "express";

export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.headers.origin as string;
  const ip = req.ip;

  if (allowedOrigins.includes(origin) || ip === process.env.ALLOWED_IP) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    next();
  } else {
    res.status(403).send("Access Forbidden");
  }
};

// Use the corsMiddleware function as middleware
app.use(corsMiddleware);

// Create schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Initialize an ApolloServer instance with your schema and resolvers
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

// Set up WebSocket server.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
const serverCleanup = useServer({ schema }, wsServer);

const PORT = 4000;

async function startApolloServer() {
  await server.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server)
  );

  // Now that our HTTP server is fully set up, actually listen.
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`
    );
  });
}

startApolloServer();
