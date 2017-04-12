import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import schemas from '../schema';

const resolverMap = {
  Query: {
    getDecisions: () => {
      const doc = schemas.Decision.find();
      return doc;
    },

    countDecisions: () => {
      return schemas.Decision.where({}).count();
    },

    countCCRR: () => {
      return schemas.CrossCuttingResearchRow.where({}).count();
    },
  },

  Mutation: {
    createDecision: (_, { decision }) => {
      const doc = new schemas.Decision(decision);
      // TODO: use validation to check if we can insert it
      doc.save();
      return doc;
    },

    createCCRR: (_, { row }) => {
      const doc = new schemas.CrossCuttingResearchRow(row);
      // TODO: use validation to check if we can insert it
      doc.save();
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
