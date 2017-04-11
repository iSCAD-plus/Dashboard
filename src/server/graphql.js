
import schemas from '../schema';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

const resolverMap = {
  Query: {
    getDecisions: () => {
      const doc = schemas.decision.find();
      console.log(doc);
      return doc;
    },
  },

  Date: new GraphQLScalarType({
    name: 'Date',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10);
      } else {
        return null;
      }
    },
  }),
};


export default resolverMap;
