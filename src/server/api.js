import express from 'express';
import compression from 'compression';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';

import graphqlSchema from './schema.graphql';
import resolvers from './resolvers';

const schema = makeExecutableSchema({
  resolvers,
  typeDefs: [graphqlSchema],
  logger: console,
});

export const createApp = () => {
  const app = express();

  // Remove annoying Express header addition.
  app.disable('x-powered-by');

  // Compress (gzip) assets in production.
  app.use(compression());

  // Used to check if the API is up
  app.use('/healthcheck', (req, res) => {
    res.send('The server seems to be up.');
  });

  // Setup graphql
  app.use('/api/graphql', () =>
    graphqlHTTP({
      schema,
      graphiql: true, // TODO: turn this off for prod
      limit: 200 * 1024,
    })
  );

  return app;
};
