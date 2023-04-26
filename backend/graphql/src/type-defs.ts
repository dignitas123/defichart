import { gql } from "apollo-server-express";

export const typeDefs = gql`
  enum TimeFrame {
    M1
    M5
    H1
    D1
    W1
  }
  type TimeStreamRecord {
    timestamp: Float!
    open: Float!
    high: Float!
    low: Float!
    close: Float!
    volume: Float
  }
  type Query {
    binRecords(
      symbol: String!
      timeFrame: TimeFrame!
      binAmount: Int!
    ): [TimeStreamRecord]
    timeFrameRecords(
      symbol: String!
      timeFrame: TimeFrame!
      binAmount: Int!
    ): [TimeStreamRecord]
  }
  type Subscription {
    tickData: TickDataResult
  }
  type TickDataResult {
    ticker: String
    volume: Float
    direction: Boolean
    price: Float
    timestamp: Float
  }
`;
