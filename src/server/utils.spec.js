import {
  getQueryKeys,
  hasMeasurePrefix,
  createGroupAggregation,
} from './utils';

const a = 'count';
const b = 'month';
const c = 'potato';

const data = {
  operation: {
    selectionSet: {
      selections: [
        {
          selectionSet: {
            selections: [
              {
                name: {
                  value: a,
                },
              },
              {
                name: {
                  value: b,
                },
              },
              {
                name: {
                  value: c,
                },
              },
            ],
          },
        },
      ],
    },
  },
};

describe('#getQueryKeys', () => {
  it('should get the keys', () => {
    expect(getQueryKeys(data)).toEqual([a, b, c]);
  });

  it('should swallow errors and return an empty array', () => {
    expect(getQueryKeys(1)).toEqual([]);
  });
});

describe('#hasMeasurePrefix', () => {
  it('should detect the correct prefix', () => {
    expect(hasMeasurePrefix(['measure', 'a'])).toBe(true);
    expect(hasMeasurePrefix(['smeasure', 'a'])).toBe(false);
  });
});

describe('#createGroupAggregation', () => {
  const keys = getQueryKeys(data);

  it('should create the correct object', () => {
    expect(createGroupAggregation(keys)).toMatchSnapshot();
  });
});
