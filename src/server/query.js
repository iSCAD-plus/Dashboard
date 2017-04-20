import R from 'ramda';
import schemas from '../schema';

export const decisionQuery = (obj, args, context, resolveInfo) => {
  const selectedFields = resolveInfo.operation.selectionSet.selections[
    0
  ].selectionSet.selections.map(selection => selection.name.value);

  const queryKeys = R.reject(R.equals('count'), selectedFields);
  const shouldUnwind = R.any(k => k.startsWith('measure'), queryKeys);

  const prepend = key =>
    key.startsWith('measure') ? `$measures.${key}` : `$${key}`;

  const id = {
    $concat: R.intersperse(
      '|',
      queryKeys.map(k => ({
        $substr: [prepend(k), 0, -1],
      }))
    ),
  };
  console.log(R.intersperse('|', queryKeys.map(k => `$${k}`)));
  console.log(id);

  const groupObj = {
    $group: queryKeys.reduce(
      (o, key) =>
        Object.assign({}, o, {
          [key]: { $first: prepend(key) },
        }),
      { _id: id, count: { $sum: 1 } }
    ),
  };

  const sort = {
    $sort: { _id: -1 },
  };

  console.log(groupObj);

  const unwindOperator = { $unwind: '$measures' };
  const pipeline = shouldUnwind
    ? [unwindOperator, groupObj, sort]
    : [groupObj, sort];

  const resultPromise = schemas.Decision.aggregate(pipeline).exec();

  return resultPromise;
};
