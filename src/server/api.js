import express from 'express';
import compression from 'compression';
// The following import is needed for reasons that elude me. -ntietz
import schemas from '../schema'; // eslint-disable-line no-unused-vars
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
