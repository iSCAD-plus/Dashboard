import R from 'ramda';
import schemas from '../schema';

export const decisionQuery = (obj, args, context, resolveInfo) => {
  const prepend = key =>
    key.startsWith('measure') ? `$measures.${key}` : `$${key}`;

  const aggregationOperator = (key) => {
    switch (key) {
      case 'count':
        return { $sum: 1 };
      case 'month':
        return { $first: { $month: prepend('date') } };
      default:
        return { $first: prepend(key) };
    }
  };

  const formId = (key) => {
    switch (key) {
      case 'count':
        return '';
      case 'month':
        return { $substr: [{ $month: prepend('date') }, 0, -1] };
      default:
        return { $substr: [prepend('date'), 0, -1] };
    }
  };

  const queryKeys = resolveInfo.operation.selectionSet.selections[
    0
  ].selectionSet.selections.map(selection => selection.name.value);

  const shouldUnwind = R.any(k => k.startsWith('measure'), queryKeys);

  const id = {
    $concat: R.intersperse('|', queryKeys.map(formId)),
  };
  console.log(R.intersperse('|', queryKeys.map(k => `$${k}`)));
  console.log(id);

  const groupObj = {
    $group: queryKeys.reduce(
      (o, key) =>
        Object.assign({}, o, {
          [key]: aggregationOperator(key),
        }),
      { _id: id, count: aggregationOperator('count') }
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
