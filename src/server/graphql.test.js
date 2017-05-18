import mongoose from 'mongoose';
import { graphql } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import R from 'ramda';

import { Decision } from '../mongoose';
import { populate, decisionSampler } from './testutils';

import resolvers from './resolvers';
import graphqlSchema from './schema.graphql';

mongoose.Promise = Promise;
mongoose.connect('localhost', 'iscad-gql-test');

console.log(graphqlSchema.substring(0, 1));
const schema = makeExecutableSchema({
  resolvers,
  typeDefs: [graphqlSchema],
  logger: console,
});

const { Query: RootQuery } = resolvers;
const runGqlQuery = query => graphql(schema, query, RootQuery);

const addDecisions = populate(Decision, decisionSampler);

const countQuery = `
  query Q {
    countDecisions
  }
`;

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
});

test('Empty DB gives empty query', async () => {
  const decisionCount = await Decision.find({}).count().exec();
  expect(decisionCount).toEqual(0);

  const query = `
    query Foo {
      getDecisions {
        decision,
        regime,
        year
      }
    }
  `;

  const result = await runGqlQuery(query);
  const expectedResult = { data: { getDecisions: [] } };

  expect(result).toEqual(expectedResult);
});

test('Empty DB should return count of 0', async () => {
  const decisionCount = await Decision.find({}).count().exec();
  expect(decisionCount).toEqual(0);

  const result = await runGqlQuery(countQuery);
  const expectedResult = { data: { countDecisions: 0 } };

  expect(result).toEqual(expectedResult);
});

test('Populated DB returns the correct count', async () => {
  const numDecisions = 100;
  await addDecisions(numDecisions);

  const result = await runGqlQuery(countQuery);
  const expectedResult = { data: { countDecisions: numDecisions } };

  expect(result).toEqual(expectedResult);
});

test('We can filter decision queries by regime', async () => {
  const numDecisions = 30;
  await addDecisions(numDecisions);

  const iraqCount = await Decision.find({ regime: 'Iraq' }).count().exec();

  const query = `
    query Q {
      decisionQuery(regime: "Iraq") {
        regime,
        count
      }
    }
  `;

  const result = await runGqlQuery(query);
  const expectedResult = {
    data: { decisionQuery: [{ regime: 'Iraq', count: iraqCount }] },
  };

  expect(result).toEqual(expectedResult);
});

test('We can filter decisions by regime', async () => {
  const numDecisions = 30;
  await addDecisions(numDecisions);

  const sudanDecisions = R.map(
    R.pick(['decision', 'regime', 'date']),
    await Decision.find({ regime: 'Sudan' }, 'decision regime date').exec()
  );

  const query = `
    query Q {
      getDecisions(regime: "Sudan") {
        decision,
        regime,
        date
      }
    }
  `;

  const result = await runGqlQuery(query);
  const expectedResult = {
    data: {
      getDecisions: sudanDecisions,
    },
  };

  expect(result).toEqual(expectedResult);
});
