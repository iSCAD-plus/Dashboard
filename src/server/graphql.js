import { GraphQLDateTime } from 'graphql-custom-types';
import graphqlHTTP from 'express-graphql';
import schemas from '../schema';
import { decisionQuery } from './query';

const resolverMap = {
  Query: {
    getDecisions(_, args) {
      const doc = schemas.Decision.find(args);
      return doc;
    },

    countDecisions() {
      return schemas.Decision.where({}).count();
    },

    countCCRR(_, { table }) {
      if (table) {
        return schemas.CrossCuttingResearchRow.where({ table }).count();
      }
      return schemas.CrossCuttingResearchRow.where({}).count();
    },

    countMandates() {
      return schemas.Mandate.where({}).count();
    },

    decisionQuery,
  },

  Mutation: {
    createDecision(_, { decision }) {
      const doc = new schemas.Decision(decision);
      if (doc.validateSync()) {
        // TODO
      }
      doc.save();
      return doc;
    },

    createCCRR(_, { row }) {
      const doc = new schemas.CrossCuttingResearchRow(row);
      // TODO: use validation to check if we can insert it
      doc.save();
      return doc;
    },

    createMandate(_, { mandate }) {
      const doc = new schemas.Mandate(mandate);
      const errors = doc.validateSync();
      if (errors) {
        console.log(errors);
        // TODO
      }
      doc.save();
      return doc;
    },
  },

  DateTime: GraphQLDateTime,
};

export const graphqlResponder = () =>
  graphqlHTTP({
    schema: schemas.graphql,
    graphiql: true, // TODO: turn this off for prod
    limit: 200 * 1024,
  });

export default resolverMap;
