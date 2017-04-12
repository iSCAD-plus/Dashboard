import { makeExecutableSchema } from 'graphql-tools';
import resolverMap from '../server/graphql';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const required = type => ({
  type,
  required: true,
});

const stringEnum = values => ({
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
  measureCategory: stringEnum(measureCategories),
  measureType: stringEnum(measureTypes),
});

const decisionTypes = ['extend', 'implementation', 'establish', 'exemption', 'intention', 'terminate'];
const decisionSchema = new Schema({
  decision: required(String),
  regime: required(String),
  year: required(Number),
  date: required(Date),
  numParagraphs: required(Number),
  decisionType: stringEnum(decisionTypes),
  measures: [measureSchema],
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
      measureType: String,
      measureCategory: String
    }

    scalar Date
  `,
  resolvers: resolverMap,
});

const Decision = mongoose.model('Decision', decisionSchema);

const schemas = {
  Decision,
  graphql: graphqlSchema,
};

export { measureCategories, measureTypes, decisionTypes };
export default schemas;
