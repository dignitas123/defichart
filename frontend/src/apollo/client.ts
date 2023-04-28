import { ApolloClient, InMemoryCache } from '@apollo/client';
import { provideApolloClient } from '@vue/apollo-composable';

const apolloClient = new ApolloClient({
  uri: 'http://ec2-3-71-112-87.eu-central-1.compute.amazonaws.com/graphql',
  cache: new InMemoryCache(),
});

export function setupGraphQL() {
  provideApolloClient(apolloClient);
}
