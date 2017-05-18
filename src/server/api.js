import cors from 'cors';
import express from 'express';
import compression from 'compression';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema } from 'graphql-tools';

import graphqlSchema from './schema.graphql';
import resolvers from './resolvers';

console.log(graphqlSchema.substring(0, 1));
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
  app.use(
    '/api/graphql',
    cors(),
    graphqlHTTP({
      schema,
      graphiql: true, // @TODO turn off in production
      limit: 200 * 1024,
    })
  );

  return app;
};
