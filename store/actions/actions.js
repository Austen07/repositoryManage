import * as actionTypes from './actionTypes';
import axios from 'axios';

export const Logout = () => {
  return dispatch => {
    axios.post('/logout')
        .then(response => {
          if(response.status === 200){
            dispatch({
              type: actionTypes.LOG_OUT
            });
          }else{
            console.log("log out fail", response);
          }
        })
        .catch(err => {
          console.log("error", err.response.data);
        });
  }
};