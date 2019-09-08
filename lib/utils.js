import moment from 'moment';

export function getLastUpdatedTime (time) {
  return moment(time).fromNow()
};