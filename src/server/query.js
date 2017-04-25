import schemas from '../schema';
import {
  createGroupAggregation,
  getQueryKeys,
  hasMeasurePrefix,
} from './utils';

const sort = { $sort: { _id: -1 } };
const unwindOperator = { $unwind: '$measures' };

export const decisionQuery = (obj, args, context, resolveInfo) => {
  const queryKeys = getQueryKeys(resolveInfo);
  const group = createGroupAggregation(queryKeys);

  const pipeline = hasMeasurePrefix(queryKeys)
    ? [unwindOperator, group, sort]
    : [group, sort];

  return schemas.Decision.aggregate(pipeline).exec();
};
