import { createStore, combineReducers, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';


import * as actionTypes from './actions/actionTypes';
import {logout} from './actions/actions';

/* initial state */ 
const userInitialState = {};


/* reducer */
const userReducer = (state = userInitialState, action) => {
  switch (action.type) {
    case actionTypes.LOG_OUT: 
      return {}
    default:
      return state;
  }
};

const allReducers = combineReducers({
  user: userReducer,
});



export default (state) => {
  const store = createStore(
    allReducers,
    Object.assign(
      {},
      {
        user: userInitialState,
      },
      state,
    ),
    composeWithDevTools(applyMiddleware(ReduxThunk)),
  );

  return store;
};
