import express from 'express';
import compression from 'compression';
import { graphqlResponder } from './graphql';

export const createApp = () => {
  const app = express();

  // Remove annoying Express header addition.
  app.disable('x-powered-by');

  // Compress (gzip) assets in production.
  app.use(compression());

  // Setup graphql
  app.use('/api/graphql', graphqlResponder());

  return app;
};
