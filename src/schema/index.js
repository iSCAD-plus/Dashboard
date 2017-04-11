
const mongoose = require('mongoose');
const { graphql, buildSchema } = require('graphql');

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

const measureCategories = ['Arms Embargo']; // TODO: put all the categories in
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

const graphqlSchema = buildSchema(`
  type Mutation {
    createDecision(decision: DecisionInput): Decision
  }

  type Query {
    getDecision: Decision
  }

  input DecisionInput {
    decision: String,
    regime: String,
    year: Int,
    date: Date,
    numParagraphs: Int,
    decisionType: String
  }

  type Decision {
    decision: String,
    regime: String,
    year: Int,
    date: Date,
    numParagraphs: Int,
    decisionType: String
  }

  scalar Date
`);

const Decision = mongoose.model('Decision', decisionSchema);

const schemas = {
  decision: Decision,
  graphql: graphqlSchema,
};

export { measureCategories, measureTypes, decisionTypes };
export default schemas;
