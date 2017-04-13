/* eslint-disable max-len */
import jsc from 'jsverify';

jasmine.addMatchers({
  // Expects that property is synchronous
  toHold() {
    return {
      compare(actual) {
        /* global window */
        const quiet = window && !/verbose=true/.test(window.location.search);

        const r = jsc.check(actual, { quiet });

        const pass = r === true;
        let message = '';

        if (pass) {
          message = 'Expected property not to hold.';
        } else {
          message = `Expected property to hold. Counterexample found: ${r.counterexamplestr}`;
        }

        return {
          pass,
          message,
        };
      },
    };
  },
});
