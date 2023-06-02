import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { provideApolloClient } from '@vue/apollo-composable';
import { split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const httpLink = new HttpLink({
  uri: 'http://ec2-3-71-112-87.eu-central-1.compute.amazonaws.com/graphql',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://ec2-3-71-112-87.eu-central-1.compute.amazonaws.com/graphql',
  })
);

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export function setupGraphQL() {
  provideApolloClient(client);
}
