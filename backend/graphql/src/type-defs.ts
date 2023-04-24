import { gql } from "apollo-server-express";

export const typeDefs = gql`
  enum TimeFrame {
    M1
    M2
    M3
    M4
    M5
    M10
    M15
    M20
    M30
    H1
    H2
    H3
    H4
    H6
    H8
    H12
    D1
    D2
    D3
    D4
    W1
    W2
    W3
    W4
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
    binRecords(timeFrame: TimeFrame!, binAmount: Int!): [TimeStreamRecord]
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
