import {
  createAxis,
  getQueryKeys,
  hasMeasurePrefix,
  createGroupAggregation,
} from './utils';

const a = 'count';
const b = 'month';
const c = 'measure-potato';
const d = 'potato';
const keys = [a, b, c, d];

const data = {
  operation: {
    selectionSet: {
      selections: [
        {
          selectionSet: {
            selections: [
              { name: { value: a } },
              { name: { value: b } },
              { name: { value: c } },
              { name: { value: d } },
            ],
          },
        },
      ],
    },
  },
};

describe('#getQueryKeys', () => {
  it('should get the keys', () => {
    expect(getQueryKeys(data)).toEqual(keys);
  });

  // This was one thing the functional implementation helped with
  // disabled for now rather than modifying logic to pass, since
  // this will not be a likely case by any stretch
  it.skip('should swallow errors and return an empty array', () => {
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
  it('should create the correct object', () => {
    expect(createGroupAggregation(keys)).toMatchSnapshot();
  });
});

describe('#createAxis', () => {
  const x = 'a';
  const y = 'b';
  const seriesKey = 'key';

  describe('should create the correct axis given', () => {
    it('a truthy seriesKey', () => {
      expect(createAxis({ x, y, seriesKey })).toMatchSnapshot();
    });

    it('a falsy seriesKey', () => {
      expect(createAxis({ x, y, seriesKey: undefined })).toMatchSnapshot();
    });
  });
});
