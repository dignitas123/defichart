import { gql } from 'graphql-tag';

export const getTimeFrameQuery = gql`
  query getTimeFrame(
    $symbol: String!
    $timeFrame: TimeFrame!
    $binAmount: Int!
    $startShift: Int
  ) {
    timeFrameRecords(
      symbol: $symbol
      timeFrame: $timeFrame
      binAmount: $binAmount
      startShift: $startShift
    ) {
      timestamp
      open
      high
      low
      close
      volume
    }
  }
`;
