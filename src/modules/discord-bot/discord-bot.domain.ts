/**
 * Extract parameters from line.
 * @param line Line without prefix nor command.
 */
export const getParametersFromLine = (line: string): string[] => {
  return line.split(' ').slice(1);
};

/**
 * Check whether a message line contains the passed prefix.
 * @param message Message to check.
 * @param prefix Prefic to check for.
 */
export const messageContainsPrefix = (message: string, prefix: string): boolean => {
  return message.indexOf(prefix) === 0 || message.includes(`\n${prefix}`);
};

/**
 * Check whether a single line contains the passed prefix.
 * @param line Line to check.
 * @param prefix Prefic to check for.
 */
export const lineContainsPrefix = (line: string, prefix: string): boolean => {
  return line.indexOf(prefix) === 0 && line.substring(prefix.length + 1).charAt(0) !== ' ';
};

/**
 * Executes the method passed, if set and of type function, with the passed params as arguments.
 * @param method Method to call (optional).
 * @param params Params to send to the method (optional).
 */
export const execute = (method: Function | undefined, ...params: any) => {
  if (typeof method !== 'function') return;
  return method(...params);
};
