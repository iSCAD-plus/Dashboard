import R from 'ramda';
import jsc from 'jsverify';
import mongoose from 'mongoose';

import { Decision, CrossCuttingResearchRow, Mandate } from './models';

import {
  ccrCategories,
  ccrStatementTypes,
  ccrTableNames,
  decisionTypes,
  leadEntities,
  mandateComponents,
  mandateSubcomponents,
  measureCategories,
  measureTypes,
} from './schemas';

mongoose.Promise = Promise;
mongoose.connect('localhost', 'iscad-mongoose-test');

test('Correct documents can be saved', async () => {
  const decision = new Decision({
    decision: 'Res. 1234',
    regime: 'Fake Country',
    year: 1991,
    date: new Date(),
    numParagraphs: 3,
    decisionType: 'extend',
    measures: [
      {
        measureCategory: 'arms embargo',
        measureType: 'establish',
      },
    ],
  });

  const error = decision.validateSync();

  expect(error).toBeFalsy();

  await decision.save();
});

test('Incorrect documents get rejected', () => {
  const badDecision = new Decision({ decision: 3 });

  const error = badDecision.validateSync();

  expect(error).toBeTruthy();
});

test('All keys (except measures) are required', () => {
  const doc = {
    decision: 'Res. 1234',
    regime: 'Fake Country',
    year: 1991,
    date: new Date(),
    numParagraphs: 3,
    decisionType: 'extend',
    measures: [
      {
        measureCategory: 'arms embargo',
        measureType: 'establish',
      },
    ],
  };

  Object.keys(doc).forEach((key) => {
    // We don't check 'measures', since it's an array and could be empty
    if (key === 'measures') return;

    const newdoc = R.omit([key], doc);
    const decision = new Decision(newdoc);
    const error = decision.validateSync();

    expect(error).toBeTruthy();
  });
});

test('Empty measures array is accepted', () => {
  const decision = new Decision({
    decision: 'Res. 1234',
    regime: 'Fake Country',
    year: 1991,
    date: new Date(),
    numParagraphs: 3,
    decisionType: 'extend',
    measures: [],
  });

  const error = decision.validateSync();

  expect(error).toBeFalsy();
});

test('Any values are accepted for Decisions', () => {
  const generator = jsc.record({
    decision: jsc.nestring,
    regime: jsc.nestring,
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

  const property = jsc.forall(generator, (x) => {
    const decision = new Decision(x);
    return decision.validateSync() === undefined;
  });

  jsc.assert(property);
});

test('Any values are accepted for CCRs', () => {
  const generator = jsc.record({
    table: jsc.elements(ccrTableNames),
    symbol: jsc.nestring,
    category: jsc.elements(ccrCategories),
    agendaItem: jsc.nestring,
    statementType: jsc.elements(ccrStatementTypes),
    paragraphId: jsc.nestring,
    provision: jsc.nestring,
    keywords: jsc.array(jsc.nestring),
  });

  const property = jsc.forall(generator, (x) => {
    const decision = new CrossCuttingResearchRow(x);
    return decision.validateSync() === undefined;
  });

  jsc.assert(property);
});

test('Any values are accepted for mandates', () => {
  const generator = jsc.record({
    name: jsc.nestring,
    location: jsc.nestring,
    originalDecision: jsc.nestring,
    subsequentDecisions: jsc.array(jsc.nestring),
    latestDecision: jsc.nestring,
    expiration: jsc.datetime,
    currentLength: jsc.nestring,
    leadEntity: jsc.elements(leadEntities),
    chapterVII: jsc.bool,
    mandateComponents: jsc.array(
      jsc.record({
        component: jsc.elements(mandateComponents),
        subcomponent: jsc.elements(mandateSubcomponents),
        excerpt: jsc.nestring,
      })
    ),
  });

  const property = jsc.forall(generator, (x) => {
    const decision = new Mandate(x);
    return decision.validateSync() === undefined;
  });

  jsc.assert(property);
});

// TODO: automated testing of passing payloads through the graphql server
