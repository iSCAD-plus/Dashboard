
const mongoose = require('mongoose');
const { graphql, buildSchema } = require('graphql');
import resolverMap from '../server/graphql';
import { makeExecutableSchema } from 'graphql-tools';

const Schema = mongoose.Schema;

const required = type => ({
  type,
  required: true
});

const stringEnum = values => ({
  type: String,
  required: true,
  enum: {
    values,
    message: 'enum validator failed for path `{PATH}` with value `{VALUE}`.',
  },
});

const measureCategories = ['arms embargo', 'trade embargo', 'financial restrictions']; // TODO: put all the categories in
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
      getDecisions: [Decision]
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
  resolvers: resolverMap
});

const Decision = mongoose.model('Decision', decisionSchema);

const schemas = {
  decision: Decision,
  graphql: graphqlSchema,
};

export { measureCategories, measureTypes, decisionTypes };
export default schemas;
