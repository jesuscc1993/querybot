export const getDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

export const getDateTime = (date = new Date()) => {
  return date.toISOString().split('.')[0].replace('T', ' ');
};

export const getTime = (date = new Date()) => {
  return date.toISOString().split(/T|\./g)[1];
};
