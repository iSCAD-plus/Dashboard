import R from 'ramda';
import jsc from 'jsverify';
import mongoose from 'mongoose';

import schemas, {
  ccrCategories,
  ccrStatementTypes,
  ccrTableNames,
  decisionTypes,
  measureCategories,
  measureTypes,
} from '.';

mongoose.connect('localhost', 'iscad-test');

test('Correct documents can be saved', () => {
  const decision = new schemas.Decision({
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
});

test('Incorrect documents get rejected', () => {
  const badDecision = new schemas.Decision({ decision: 3 });

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
    const decision = new schemas.Decision(newdoc);
    const error = decision.validateSync();

    expect(error).toBeTruthy();
  });
});

test('Empty measures array is accepted', () => {
  const decision = new schemas.Decision({
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
  const doc = {
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
  };
  const generator = jsc.record(doc);

  const property = jsc.forall(generator, (x) => {
    const decision = new schemas.Decision(x);
    return decision.validateSync() === undefined;
  });

  jsc.assert(property);
});

test('Any values are accepted for CCRs', () => {
  const doc = {
    table: jsc.elements(ccrTableNames),
    category: jsc.elements(ccrCategories),
    agendaItem: jsc.nestring,
    statementType: jsc.elements(ccrStatementTypes),
    paragraphId: jsc.nestring,
    provision: jsc.nestring,
    keywords: jsc.array(jsc.nestring),
  };
  const generator = jsc.record(doc);

  const property = jsc.forall(generator, (x) => {
    const decision = new schemas.CrossCuttingResearchRow(x);
    return decision.validateSync() === undefined;
  });

  jsc.assert(property);
});

// TODO: automated testing of passing payloads through the graphql server
