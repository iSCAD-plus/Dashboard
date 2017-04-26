import schemas from '../schema';
import {
  createGroupAggregation,
  getQueryKeys,
  hasMeasurePrefix as shouldUnwind,
} from './utils';

const sort = { $sort: { _id: -1 } };
const unwindOperator = { $unwind: '$measures' };

export const decisionQuery = (obj, args, context, resolveInfo) => {
  const queryKeys = getQueryKeys(resolveInfo);
  const group = createGroupAggregation(queryKeys);
  const filterOperator = { $match: args };

  const pipeline = shouldUnwind(queryKeys)
    ? [filterOperator, unwindOperator, group, sort]
    : [filterOperator, group, sort];

  return schemas.Decision.aggregate(pipeline).exec();
};
