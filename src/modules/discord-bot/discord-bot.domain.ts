export const noop = () => {};

export const getParametersFromInput = (input: string) => input.split(' ').slice(1);

export const execute = (method: Function | undefined, ...params: any) => {
  const finalMethod = typeof method === 'function' ? method : noop;
  finalMethod(...params);
};
