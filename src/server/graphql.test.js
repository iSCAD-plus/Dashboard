import mongoose from 'mongoose';
import { graphql } from 'graphql';
import R from 'ramda';
import resolverMap from './graphql';
import schemas from '../schema';

mongoose.Promise = Promise;
mongoose.connect('localhost', 'iscad-test-temp');

beforeEach(async () => {
  const onError = (err) => {
    if (err && err.message !== 'ns not found') {
      console.log(err);
    }
  };
  const drop = (coll) => {
    coll.count();
    coll.drop(onError);
  };
  R.map(drop, mongoose.connection.collections);
});

test('Empty DB gives empty query', async () => {
  const query = `
    query Foo {
      getDecisions {
        decision,
        regime,
        year
      }
    }
  `;

  const result = await graphql(schemas.graphql, query, resolverMap.Query);
  const expectedResult = { data: { getDecisions: [] } };

  expect(result).toEqual(expectedResult);
});

test('Empty DB should return count of 0', async () => {
  const query = `
    query Q {
      countDecisions
    }
  `;

  const result = await graphql(schemas.graphql, query, resolverMap.Query);
  const expectedResult = { data: { countDecisions: 0 } };

  expect(result).toEqual(expectedResult);
});
