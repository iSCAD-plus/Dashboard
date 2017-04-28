import mongoose from 'mongoose';
import { graphql } from 'graphql';
import R from 'ramda';
import jsc from 'jsverify';
import resolverMap from './graphql';
import schemas, {
  decisionTypes,
  measureCategories,
  measureTypes,
} from '../schema';

mongoose.Promise = Promise;
mongoose.connect('localhost', 'iscad-test-temp');

const decisionSpec = jsc.record({
  decision: jsc.nestring,
  regime: jsc.elements(['Iraq', 'DRC', 'Sudan', 'Iran', 'Burundi']),
  year: jsc.integer,
  date: jsc.datetime,
  numParagraphs: jsc.nat,
  decisionType: jsc.elements(decisionTypes),
  measures: jsc.array(
    jsc.record({
      measureCategory: jsc.elements(measureCategories),
      measureType: jsc.elements(measureTypes),
    })
  ),
});
const decisionMaker = jsc.sampler(decisionSpec);

const addDecisions = async (numDecisions) => {
  const promises = decisionMaker(numDecisions).map(each =>
    new schemas.Decision(each).save()
  );
  await Promise.all(promises);
};

const countQuery = `
  query Q {
    countDecisions
  }
`;

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
  const result = await graphql(schemas.graphql, countQuery, resolverMap.Query);
  const expectedResult = { data: { countDecisions: 0 } };

  expect(result).toEqual(expectedResult);
});

test('Populated DB returns the correct count', async () => {
  const numDecisions = 100;
  await addDecisions(numDecisions);

  const result = await graphql(schemas.graphql, countQuery, resolverMap.Query);
  const expectedResult = { data: { countDecisions: numDecisions } };

  expect(result).toEqual(expectedResult);
});

test('We can filter by regime', async () => {
  const numDecisions = 200;
  await addDecisions(numDecisions);

  const iraqCount = await schemas.Decision
    .find({ regime: 'Iraq' })
    .count()
    .exec();

  const query = `
    query DecisionsByRegime {
      getDecisions(regime: "Iraq") {
        decision
      }
    }
  `;

  const result = await graphql(schemas.graphql, query, resolverMap.Query);
  const expectedResult = { data: { countDecisions: iraqCount } };

  expect(result).toEqual(expectedResult);
});
