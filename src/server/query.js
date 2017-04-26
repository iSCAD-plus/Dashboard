import R from 'ramda';
import schemas from '../schema';

export const decisionQuery = (obj, args, context, resolveInfo) => {
  const prepend = R.ifElse(
    R.test(/^measure/),
    R.concat('$measures.'),
    R.concat('$')
  );

  const aggregationOperator = R.cond([
    [R.equals('count'), R.always({ $sum: 1 })],
    [R.equals('month'), R.always({ $first: { $month: prepend('date') } })],
    [R.T, key => ({ $first: prepend(key) })],
  ]);

  const formId = R.cond([
    [R.equals('count'), R.always('')],
    [
      R.equals('month'),
      R.always({ $substr: [{ $month: prepend('date') }, 0, -1] }),
    ],
    [R.T, key => ({ $substr: [prepend(key), 0, -1] })],
  ]);

  const queryKeys = resolveInfo.operation.selectionSet.selections[
    0
  ].selectionSet.selections.map(selection => selection.name.value);

  const shouldUnwind = R.any(k => k.startsWith('measure'), queryKeys);

  const id = {
    $concat: R.intersperse('|', queryKeys.map(formId)),
  };

  const groupObj = {
    $group: queryKeys.reduce(
      (o, key) =>
        Object.assign({}, o, {
          [key]: aggregationOperator(key),
        }),
      { _id: id }
    ),
  };

  const sort = {
    $sort: { _id: -1 },
  };

  const filterOperator = {
    $match: args,
  };

  const unwindOperator = { $unwind: '$measures' };
  const pipeline = shouldUnwind
    ? [filterOperator, unwindOperator, groupObj, sort]
    : [filterOperator, groupObj, sort];

  const resultPromise = schemas.Decision.aggregate(pipeline).exec();

  return resultPromise;
};
