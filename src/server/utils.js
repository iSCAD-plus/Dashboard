import R from 'ramda';
import S from 'sanctuary';
import { simpleClique } from 'cliquer';

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

const generateId = S.pipe([
  R.map(formId),
  R.intersperse('|'),
  R.objOf('$concat'),
]);

export const getQueryKeys = S.pipe([
  R.path(['operation', 'selectionSet', 'selections']),
  R.head,
  R.path(['selectionSet', 'selections']),
  R.map(R.path(['name', 'value'])),
]);

export const createGroupAggregation = keys => ({
  $group: {
    ...simpleClique(aggregationOperator, keys),
    _id: generateId(keys),
  },
});

export const hasMeasurePrefix = R.any(k => k.startsWith('measure'));

export const createAxis = ({ x, y, seriesKey }) =>
  (seriesKey ? { x, y, seriesKey } : { x, y });
