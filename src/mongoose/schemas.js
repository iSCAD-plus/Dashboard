import { Schema } from 'mongoose';
import { required, optionalEnum, requiredEnum } from './utils';

export const plotSchema = new Schema({
  name: required(String),
  query: required(Object),
  axis: required({
    x: required(String),
    y: required(String),
    seriesKey: String,
  }),
  types: [String],
});

export const measureCategories = [
  'drug precursor embargo',
  'luxury goods embargo',
  'transportation and aviation sanctions',
  'diplomatic or overseas representation restrictions',
  'chemical and biological weapons embargo',
  'arms embargo',
  'ban on arms exports by target state',
  'financial restrictions',
  'public financial support for trade restrictions',
  'prohibition of bunkering services',
  'travel ban or restrictions',
  'business restrictions',
  'charcoal ban',
  'trade ban on cultural goods',
  'asset freeze',
  'trade embargo',
  'restrictions on ballistic missiles',
  'embargo on natural resources',
  'non-proliferation measures',
  'oil/petroleum embargo',
];

export const measureTypes = [
  'establish',
  'modify',
  'extend',
  'terminate',
  'limited extend',
];

const measureSchema = new Schema({
  measureCategory: requiredEnum(measureCategories),
  measureType: requiredEnum(measureTypes),
});

export const decisionTypes = [
  'extend',
  'implementation',
  'establish',
  'exemption',
  'intention',
  'terminate',
];

export const decisionSchema = new Schema({
  decision: required(String),
  regime: required(String),
  year: required(Number),
  date: required(Date),
  numParagraphs: required(Number),
  decisionType: requiredEnum(decisionTypes),
  measures: [measureSchema],
});

export const ccrTableNames = ['wps', 'caac', 'poc'];
export const ccrCategories = ['thematic', 'country/region'];
export const ccrStatementTypes = ['pp', 'op', 'prst'];
export const ccrSchema = new Schema({
  table: requiredEnum(ccrTableNames),
  symbol: required(String),
  category: requiredEnum(ccrCategories),
  agendaItem: required(String),
  statementType: requiredEnum(ccrStatementTypes),
  paragraphId: required(String),
  provision: required(String),
  keywords: [String],
});

export const mandateComponents = [
  'Rule of law (ROL)',
  'Humanitarian support',
  'Public information',
  'Political process',
  'Electoral assistance',
  'Support to sanctions regimes',
  'Military and police',
  'Support to State institutions',
  'Security sector reform (SSR)',
  'Human rights, women and peace and security, and children and armed conflict',
  'International cooperation and coordination',
  'Civilian-military coordination',
  'Demilitarization and arms management',
  'Authorization of the use of force',
];

export const mandateSubcomponents = [
  'Judicial matters',
  'Protection of civilians, including refugees and IDPs',
  ':DPA-led',
  'Support to military',
  'Ceasefire monitoring',
  ':DPKO-led',
  'Security monitoring - patrolling - deterrence',
  'Protection of humanitarian/UN personnel and facilities / free movement of personnel and equipment', // eslint-disable-line max-len
  'Support to police',
  'Maritime security',
];

export const mandateComponentSchema = new Schema({
  component: requiredEnum(mandateComponents),
  subcomponent: optionalEnum(mandateSubcomponents),
  resolutions: String,
  excerpt: String,
});

export const leadEntities = ['DPKO', 'DPA', 'DPKO/AU'];
export const mandateSchema = new Schema({
  name: required(String),
  location: String,
  originalDecision: required(String),
  subsequentDecisions: [String],
  latestDecision: String,
  expiration: Date,
  currentLength: required(String),
  leadEntity: requiredEnum(leadEntities),
  chapterVII: required(Boolean),
  authorizationOfUseOfForce: mandateComponentSchema,
  mandateComponents: [mandateComponentSchema],
});
