export const getDate = () => {
  return new Date().toISOString().split('T')[0];
};

export const getTime = () => {
  return new Date().toISOString().split(/T|\./g)[1];
};
