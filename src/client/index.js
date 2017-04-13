import React from 'react';
import { render } from 'react-dom';
// import { AppContainer } from 'react-hot-loader';

import Root from './Root';

// If using hot loader this should be wrapped in the AppContainer component
const mount = RootComponent =>
  render(<RootComponent />, document.querySelector('#root'));

// if (module.hot) {
//   module.hot.accept('./Root', () => {
//     // eslint-disable-next-line global-require,import/newline-after-import
//     const RootComponent = require('./Root').default;
//     mount(RootComponent);
//   });
// }

mount(Root);
