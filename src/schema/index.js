import { makeExecutableSchema } from 'graphql-tools';
import resolverMap from '../server/graphql';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const required = type => ({
  type,
  required: true,
});

const requiredEnum = values => ({
  type: String,
  required: true,
  enum: {
    values,
    message: 'enum validator failed for path `{PATH}` with value `{VALUE}`.',
  },
});

const measureCategories = ['drug precursor embargo', 'luxury goods embargo', 'transportation and aviation sanctions', 'diplomatic or overseas representation restrictions', 'chemical and biological weapons embargo', 'arms embargo', 'ban on arms exports by target state', 'financial restrictions', 'public financial support for trade restrictions', 'prohibition of bunkering services', 'travel ban or restrictions', 'business restrictions', 'charcoal ban', 'trade ban on cultural goods', 'asset freeze', 'trade embargo', 'restrictions on ballistic missiles', 'embargo on natural resources', 'non-proliferation measures', 'oil/petroleum embargo'];
const measureTypes = ['establish', 'modify', 'extend', 'terminate', 'limited extend'];
const measureSchema = new Schema({
  measureCategory: requiredEnum(measureCategories),
  measureType: requiredEnum(measureTypes),
});

const decisionTypes = ['extend', 'implementation', 'establish', 'exemption', 'intention', 'terminate'];
const decisionSchema = new Schema({
  decision: required(String),
  regime: required(String),
  year: required(Number),
  date: required(Date),
  numParagraphs: required(Number),
  decisionType: requiredEnum(decisionTypes),
  measures: [measureSchema],
});

const ccrTableNames = ['wps', 'caac', 'poc'];
const ccrCategories = ['thematic', 'country/region'];
const ccrStatementTypes = ['pp', 'op', 'prst'];
const ccrSchema = new Schema({
  table: requiredEnum(ccrTableNames),
  category: requiredEnum(ccrCategories),
  agendaItem: required(String),
  statementType: requiredEnum(ccrStatementTypes),
  paragraphId: required(String),
  provision: required(String),
  keywords: [String],
});

const graphqlSchema = makeExecutableSchema({
  typeDefs: `
    type Mutation {
      createDecision(decision: DecisionInput): Decision
    }

    type Query {
      getDecisions: [Decision],
      countDecisions: Int
    }

    input DecisionInput {
      decision: String!,
      regime: String!,
      year: Int!,
      date: Date!,
      numParagraphs: Int!,
      decisionType: String!,
      measures: [MeasureInput]
    }

    input MeasureInput {
      measureType: String,
      measureCategory: String
    }

    type Decision {
      decision: String,
      regime: String,
      year: Int,
      date: Date,
      numParagraphs: Int,
      decisionType: String,
      measures: [Measure]
    }

    type Measure {
      measureType: String, # TODO: rename
      measureCategory: String # TODO: rename
    }

    scalar Date

    type CrossCuttingResearchRow {
      table: String,
      category: String,
      agendaItem: String,
      statementType: String,
      paragraphId: String,
      provision: String,
      keywords: [String]
    }

  `,
  resolvers: resolverMap,
});

const Decision = mongoose.model('Decision', decisionSchema);
const CrossCuttingResearchRow = mongoose.model('CrossCuttingResearch', ccrSchema);

const schemas = {
  Decision,
  CrossCuttingResearchRow,
  graphql: graphqlSchema,
};

export { measureCategories, measureTypes, decisionTypes };
export { ccrTableNames, ccrCategories, ccrStatementTypes };
export default schemas;
