import mongoose from 'mongoose';
import {
  ccrSchema,
  decisionSchema,
  mandateSchema,
  plotSchema,
} from './schemas';

const model = mongoose.model.bind(mongoose);
export const Plot = model('Plot', plotSchema);
export const Mandate = model('Mandate', mandateSchema);
export const Decision = model('Decision', decisionSchema);
export const CrossCuttingResearchRow = model('CrossCuttingResearch', ccrSchema);
