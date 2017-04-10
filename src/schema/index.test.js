import schemas from '.';

const mongoose = require('mongoose');

mongoose.connect('localhost', 'iscad-test');

test('Correct documents can be saved', () => {
  const decision = new schemas.decision({
    decision: 'Res. 1234',
    regime: 'Fake Country',
    year: 1991,
    date: new Date(),
    numParagraphs: 3,
    decisionType: 'extend',
    measures: [{
      measureCategory: 'Arms Embargo',
      measureType: 'establish',
    }],
  });

  const error = decision.validateSync();

  expect(error).toBeFalsy();
});

test('Incorrect documents get rejected', () => {
  const badDecision = new schemas.decision({decision: 3});

  const error = badDecision.validateSync();

  expect(error).toBeTruthy();
});

test('All keys are required', () => {
  const doc = {
    decision: 'Res. 1234',
    regime: 'Fake Country',
    year: 1991,
    date: new Date(),
    numParagraphs: 3,
    decisionType: 'extend',
    measures: [{
      measureCategory: 'Arms Embargo',
      measureType: 'establish',
    }],
  };

  for (var key in doc) {
    var newdoc = Object.assign({}, doc);
    delete newdoc[key];

    const decision = new schemas.decision(newdoc);
    const error = decision.validateSync();

    expect(error).toBeTruthy();
  }

});

