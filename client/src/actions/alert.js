import { SET_ALERT, REMOVE_ALERT } from './types';

export const setAlert = (msg, alertType, timeout = 5000) => (dispatch) => {
  const id =
    parseInt(Math.round(Math.random() * 10000000), 10).toString(36) +
    '-' +
    parseInt(Math.round(Math.random() * 10000000), 10).toString(36);

  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id }
  });

  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
