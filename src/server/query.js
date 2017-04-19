import schemas from '../schema';

export const decisionQuery = (obj, args, context, resolveInfo) => {
  console.log('obj: ');
  console.log(obj);
  console.log('\n\n');
  console.log('resolveInfo: ');
  // const names = resolveInfo.operation.selectionSet.selections.map(
  //  selection => selection.name.value
  // );
  const names2 = resolveInfo.operation.selectionSet.selections[
    0
  ].selectionSet.selections.map(selection => selection.name.value);
  console.log(names2);
  console.log('\n\n');

  console.log(
    schemas.Decision
      .aggregate([
        {
          $group: {
            _id: '$year',
            year: { $first: '$year' },
            count: { $sum: 1 },
          },
        },
      ])
      .exec()
      .then(x => console.log(x))
  );

  return null;
};
