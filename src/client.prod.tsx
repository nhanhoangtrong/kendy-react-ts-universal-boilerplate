import * as React from 'react';
import { hydrate } from 'react-dom';
import App from './components/App';
import { configureStore, apolloClient } from './redux';

import { createBrowserHistory } from 'history';

const history = createBrowserHistory();
const store = configureStore(history, window.__PRELOADEDSTATE__);

hydrate(<App store={store} history={history} client={apolloClient}/>, document.getElementById('app'));
