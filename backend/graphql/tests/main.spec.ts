import request from "supertest";
import { ApolloServer, ExpressContext, gql } from "apollo-server-express";
import express, { Application } from "express";

describe("GraphQL API", () => {
  let server: ApolloServer<ExpressContext>;
  let app: Application;

  beforeAll(async () => {
    const typeDefs = gql`
      type Query {
        hello: String
      }
    `;
    const resolvers = {
      Query: {
        hello: (): string => "Hello world!",
      },
    };
    server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    app = express();
    await server.start();
    server.applyMiddleware({ app });
  });

  afterAll(async () => {
    await server.stop();
  });

  test("returns a hello world message", async () => {
    const res = await request(app)
      .post(server.graphqlPath)
      .send({ query: "{ hello }" });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.hello).toEqual("Hello world!");
  });
});
