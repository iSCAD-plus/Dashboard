import schemas from '.';

const mongoose = require('mongoose');

mongoose.connect('localhost', 'iscad-test');

test('Correct documents can be saved', async () => {
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

  var handledErrors = false;

  const promise = decision.save(function (err, savedDecision, numAffected) {
    expect(err).toBeFalsy();
    //handledErrors = true;
  }).then(() => {
    console.log("accepted");
    expect(handledErrors).toBe(true);
  }, () => { console.log("rejected"); });

  await expect(promise).resolves;
});

test('Incorrect documents get rejected', () => {
  var errorHandler = jest.fn().mockImplementation(function(err) {
    console.log('in here');
    return 0;
  });

  const badDecision = new schemas.decision({decision: 3});

  const promise = badDecision.save(function (err, savedDecision, numAffected) {
    expect(err).toBeTruthy();
  });

//  promise.then(() => {
//    console.log(errorHandler.mock.calls.length);
//    expect(errorHandler).toHaveBeenCalledTimes(2);
//  });
//
  expect(promise).resolves;
});

