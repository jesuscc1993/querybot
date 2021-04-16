import { DiscordBotLogger } from 'discord-bot';

export const outputError = (
  logger: DiscordBotLogger,
  error: Error | string,
  functionName: string,
  parameters?: Array<string | number | boolean | undefined>,
) => {
  let errorMessage: string = `${error} thrown`;
  if (functionName) errorMessage += ` when calling ${functionName}`;
  if (parameters) errorMessage += ` with parameters: ${parameters.join(', ')}`;
  logger.error(`${errorMessage}.`);
};
