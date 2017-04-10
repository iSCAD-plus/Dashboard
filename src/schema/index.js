
const mongoose = require('mongoose');

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


const measureSchema = new Schema({
  measureCategory: stringEnum(['Arms Embargo']), // TODO: put all the categories in
  measureType: stringEnum(['establish', 'modify', 'extend', 'terminate', 'limited extend']),
});

const decisionSchema = new Schema({
  decision: required(String),
  regime: required(String),
  year: required(Number),
  date: required(Date),
  numParagraphs: required(Number),
  decisionType: stringEnum(['extend', 'implementation', 'establish', 'exemption', 'intention', 'terminate']),
  measures: required([measureSchema]),
});

const Decision = mongoose.model('Decision', decisionSchema);

const schemas = {
  decision: Decision,
}

export default schemas;

