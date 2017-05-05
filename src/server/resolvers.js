import { GraphQLDateTime } from 'graphql-custom-types';

import { decisionQuery } from './query';
import { CrossCuttingResearchRow, Decision, Mandate } from '../mongoose';

export default {
  Query: {
    getDecisions(_, args) {
      return Decision.find(args);
    },

    countDecisions() {
      return Decision.where({}).count();
    },

    countCCRR(_, { table }) {
      const query = table ? { table } : {};
      return CrossCuttingResearchRow.where(query).count();
    },

    countMandates() {
      return Mandate.where({}).count();
    },

    decisionQuery,
  },

  Mutation: {
    createDecision(_, { decision }) {
      const doc = new Decision(decision);
      if (doc.validateSync()) {
        // TODO
      }
      doc.save();
      return doc;
    },

    createCCRR(_, { row }) {
      const doc = new CrossCuttingResearchRow(row);
      // TODO: use validation to check if we can insert it
      doc.save();
      return doc;
    },

    createMandate(_, { mandate }) {
      const doc = new Mandate(mandate);
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
