import { gql } from 'graphql-tag';

export const tickDataStreamSubscription = gql`
  subscription TickData {
    tickData {
      direction
      price
      ticker
      timestamp
      volume
    }
  }
`;
