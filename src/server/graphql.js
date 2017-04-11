import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import schemas from '../schema';

const resolverMap = {
  Query: {
    getDecisions: () => {
      const doc = schemas.decision.find();
      return doc;
    },
  },

  Mutation: {
    createDecision: (_, { decision }) => {
      const doc = new schemas.Decision(decision);
      // TODO: use validation to check if we can insert it
      doc.save();
      return doc;
    }
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
