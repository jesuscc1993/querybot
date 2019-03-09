import { DiscordBotLogger } from '../modules/discord-bot';

export const outputError = (logger: DiscordBotLogger, error: Error | string, functionName: string, ...parameters: any) => {
  let errorMessage: string = `${error} thrown`;
  if (functionName) errorMessage += ` when calling ${functionName}`;
  if (parameters) errorMessage += ` with parameters ${parameters}`;
  logger.error(errorMessage);
};
