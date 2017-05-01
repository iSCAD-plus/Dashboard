export const required = type => ({
  type,
  required: true,
});

export const optionalEnum = values => ({
  type: String,
  enum: {
    values,
    message: 'enum validator failed for path `{PATH}` with value `{VALUE}`.',
  },
});

export const requiredEnum = values => ({
  type: String,
  required: true,
  enum: {
    values,
    message: 'enum validator failed for path `{PATH}` with value `{VALUE}`.',
  },
});
