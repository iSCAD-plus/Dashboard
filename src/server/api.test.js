import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from './api';

import { Decision } from '../mongoose';
import { populate, decisionSampler } from './testutils';

mongoose.Promise = Promise;
mongoose.connect('localhost', 'iscad-api-test');

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
});

describe('API responds correctly to requests', () => {
  const app = createApp();

  it('responds to healthcheck requests', () =>
    request(app).get('/healthcheck').expect(200, 'The server seems to be up.'));

  it('responds to empty graphql requests', () =>
    request(app).get('/api/graphql').expect(400));

  it('responds to graphql requests', () =>
    request(app)
      .get('/api/graphql')
      .send({ query: 'query Q { countDecisions }' })
      .expect(200, { data: { countDecisions: 0 } }));
});

describe('API responds from fully populated database', async () => {
  await populate(Decision, decisionSampler)(30);

  const app = createApp();

  it('correctly counts the decisions', () =>
    request(app)
      .get('/api/graphql')
      .send({ query: 'query Q { countDecisions }' })
      .expect(200, { data: { countDecisions: 30 } }));
});
