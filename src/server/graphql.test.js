import mongoose from 'mongoose';
import { graphql } from 'graphql';
import jsc from 'jsverify';
import schemas, {
  decisionTypes,
  measureCategories,
  measureTypes,
} from '../schema';
import resolverMap from './graphql';

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
  await mongoose.connection.dropDatabase();
});

test('Empty DB gives empty query', async () => {
  const decisionCount = await schemas.Decision.find({}).count().exec();
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

  const result = await graphql(schemas.graphql, query, resolverMap.Query);
  const expectedResult = { data: { getDecisions: [] } };

  expect(result).toEqual(expectedResult);
});

test('Empty DB should return count of 0', async () => {
  const decisionCount = await schemas.Decision.find({}).count().exec();
  expect(decisionCount).toEqual(0);

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
  const numDecisions = 10;
  await addDecisions(numDecisions);

  const iraqCount = await schemas.Decision
    .find({ regime: 'Iraq' })
    .count()
    .exec();

  const query = `
    query Q {
      decisionQuery(regime: "Iraq") {
        regime,
        count
      }
    }
  `;

  const result = await graphql(schemas.graphql, query, resolverMap.Query);
  const expectedResult = {
    data: { decisionQuery: [{ regime: 'Iraq', count: iraqCount }] },
  };

  expect(result).toEqual(expectedResult);
});
