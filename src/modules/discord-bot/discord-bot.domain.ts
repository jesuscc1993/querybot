import { Message } from 'discord.js';

export const noop = () => {};

/**
 * Extract parameters from line.
 * @param line Line without prefix nor command.
 */
export const getParametersFromLine = (line: string) => line.split(' ').slice(1);

export const messageContainsPrefix = (message: Message, prefix: string) =>
  message.content.indexOf(prefix) === 0 || message.content.indexOf(`\n${prefix}`) > 0;

export const lineContainsPrefix = (line: string, prefix: string) =>
  line.indexOf(prefix) === 0 && line.substring(prefix.length + 1).charAt(0) !== ' ';

export const execute = (method: Function | undefined, ...params: any) => {
  const finalMethod = typeof method === 'function' ? method : noop;
  finalMethod(...params);
};
