/* eslint-disable no-underscore-dangle */
import R from 'ramda';
import S from 'sanctuary';
import { simpleClique } from 'cliquer';

// Make a map of lenses from a list of strings
export const makeLenses = simpleClique(R.lensProp);

// Version of R.view that returns `Just` the value or `Nothing`
export const viewSafe = S.encase2(R.view);

// Takes a lens and a list, acts like `R.pluck` using the lens
// as a property accessor and returns `Just` an array of the results
export const deepPluck = S.curry2((lens, xs) =>
  S.pipe([S.map(viewSafe(lens)), S.justs])(xs));

const prepend = R.ifElse(
  R.test(/^measure/),
  R.concat('$measures'),
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

const L = makeLenses([
  'name',
  'operation',
  'resolveInfo',
  'selections',
  'selectionSet',
  'value',
  0,
]);

export const lenses = L;

export const getQueryKeys = S.pipe([
  // this composed lens could be exported used with `set` or `over` as well
  viewSafe(
    R.compose(
      L.operation,
      L.selectionSet,
      L.selections,
      L[0],
      L.selectionSet,
      L.selections
    )
  ),
  S.map(deepPluck(S.compose(L.name, L.value))),
  S.fromMaybe([]),
]);

// Comparable to:
// export const getQueryKeys = xs => xs
//   .operation
//   .selectionSet
//   .selections[0]
//   .selectionSet
//   .selections
//   .map(x => x.name.value);

export const createGroupAggregation = S.pipe([
  S.T,
  S.map(S.__, [
    S.pipe([generateId, R.objOf('_id')]),
    simpleClique(aggregationOperator),
  ]),
  R.mergeAll,
  R.objOf('$group'),
]);

// Comparable to:o
// export function createGroupAggregation(keys) {
//   return {
//     $group: keys.reduce(
//       (o, key) =>
//         Object.assign({}, o, {
//           [key]: aggregationOperator(key),
//         }),
//       { _id: generateId(keys) }
//     ),
//   };
// }

export const hasMeasurePrefix = R.any(k => k.startsWith('measure'));
