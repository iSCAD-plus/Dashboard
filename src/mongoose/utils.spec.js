import { required, optionalEnum, requiredEnum } from './utils';

it('#require', () => {
  expect(required('toast')).toMatchSnapshot();
});

const values = [1, 2, 3];
it('#optionalEnum', () => {
  expect(optionalEnum(values)).toMatchSnapshot();
});

it('#requiredEnum', () => {
  expect(requiredEnum(values)).toMatchSnapshot();
});
