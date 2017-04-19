import express from 'express';
import mongoose from 'mongoose';
import graphqlHTTP from 'express-graphql';
import compression from 'compression';
import path from 'path';
import React from 'react';
import RouterContext from 'react-router/lib/RouterContext';
import createMemoryHistory from 'react-router/lib/createMemoryHistory';
import match from 'react-router/lib/match';
import { renderToString } from 'react-dom/server';

import template from './template';
import routes from '../routes';
import schemas from '../schema';
import root from './graphql';

mongoose.connect('localhost', 'iscad-test'); // TODO: connect to a real db

const clientAssets = require(KYT.ASSETS_MANIFEST); // eslint-disable-line import/no-dynamic-require
const port = parseInt(KYT.SERVER_PORT, 10);
const app = express();

// Remove annoying Express header addition.
app.disable('x-powered-by');

// Compress (gzip) assets in production.
app.use(compression());

// Setup the public directory so that we can server static assets.
app.use(express.static(path.join(process.cwd(), KYT.PUBLIC_DIR)));

// Setup graphql
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schemas.graphql,
    rootValue: root,
    graphiql: true, // TODO: turn this off for prod
    limit: 200 * 1024,
  })
);

// Setup server side routing.
app.get('*', (request, response) => {
  const history = createMemoryHistory(request.originalUrl);

  match({ routes, history }, (error, redirectLocation, renderProps) => {
    if (error) {
      response.status(500).send(error.message);
    } else if (redirectLocation) {
      response.redirect(
        302,
        `${redirectLocation.pathname}${redirectLocation.search}`
      );
    } else if (renderProps) {
      // When a React Router route is matched then we render
      // the components and assets into the template.
      response.status(200).send(
        template({
          root: renderToString(<RouterContext {...renderProps} />),
          jsBundle: clientAssets.main.js,
          cssBundle: clientAssets.main.css,
        })
      );
    } else {
      response.status(404).send('Not found');
    }
  });
});

app.listen(port, () => {
  console.log(`✅  server started on port: ${port}`); // eslint-disable-line no-console
});
