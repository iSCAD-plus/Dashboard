import schemas from '.';
import { measureCategories, measureTypes, decisionTypes } from '.';
import { ccrTableNames, ccrCategories, ccrStatementTypes } from '.';

const mongoose = require('mongoose');

mongoose.connect('localhost', 'iscad-test');

test('Correct documents can be saved', () => {
  const decision = new schemas.Decision({
    decision: 'Res. 1234',
    regime: 'Fake Country',
    year: 1991,
    date: new Date(),
    numParagraphs: 3,
    decisionType: 'extend',
    measures: [{
      measureCategory: 'arms embargo',
      measureType: 'establish',
    }],
  });

  const error = decision.validateSync();

  expect(error).toBeFalsy();
});

test('Incorrect documents get rejected', () => {
  const badDecision = new schemas.Decision({decision: 3});

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
    measures: [{
      measureCategory: 'arms embargo',
      measureType: 'establish',
    }],
  };

  for (var key in doc) {
    // We don't check 'measures', since it's an array and could be empty
    if (key === 'measures') continue;

    var newdoc = Object.assign({}, doc);
    delete newdoc[key];

    const decision = new schemas.Decision(newdoc);
    const error = decision.validateSync();

    expect(error).toBeTruthy();
  }
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
  const jsc = require('jsverify');

  const doc = {
    decision: jsc.nestring,
    regime: jsc.nestring,
    year: jsc.integer,
    date: jsc.datetime,
    numParagraphs: jsc.nat,
    decisionType: jsc.elements(decisionTypes),
    measures: jsc.array(jsc.record({
      measureCategory: jsc.elements(measureCategories),
      measureType: jsc.elements(measureTypes),
    })),
  };
  const generator = jsc.record(doc);

  const property = jsc.forall(generator, function(doc) {
    const decision = new schemas.Decision(doc);
    return decision.validateSync() === undefined;
  });

  jsc.assert(property);
});

test('Any values are accepted for CCRs', () => {
  const jsc = require('jsverify');

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

  const property = jsc.forall(generator, function(doc) {
    const decision = new schemas.CrossCuttingResearchRow(doc);
    return decision.validateSync() === undefined;
  });

  jsc.assert(property)
});

