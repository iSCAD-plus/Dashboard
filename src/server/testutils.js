import jsc from 'jsverify';
import {
  decisionTypes,
  measureCategories,
  measureTypes,
} from '../mongoose/schemas';

const decisionSpec = jsc.record({
  decision: jsc.nestring,
  regime: jsc.elements(['Iraq', 'DRC', 'Sudan', 'Iran', 'Burundi']),
  year: jsc.integer,
  date: jsc.datetime,
  numParagraphs: jsc.nat,
  decisionType: jsc.elements(decisionTypes),
  measures: jsc.array(
    jsc.record({
      measureCategory: jsc.elements(measureCategories),
      measureType: jsc.elements(measureTypes),
    })
  ),
});
export const decisionSampler = jsc.sampler(decisionSpec);

export const populate = (Model, sampler) => async (numDecisions) => {
  const promises = sampler(numDecisions).map(each => new Model(each).save());
  await Promise.all(promises);
};
