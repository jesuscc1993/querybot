import { Logger } from 'winston';

export class EventsUtil {
  public static setupHandlers(logger: Logger) {
    const unhandledRejections: Map<Promise<any>, string> = new Map();
    process.on('exit', (exitCode: number) => {
      logger.error(`Forced exit of code: ${exitCode}`);
    });
    process.on('unhandledRejection', (reason: string, promise: Promise<any>) => {
      unhandledRejections.set(promise, reason);
      logger.error(`Unhandled rejection: ${promise} ${reason}`);
    });
    process.on('rejectionHandled', (promise: Promise<any>) => {
      unhandledRejections.delete(promise);
      logger.error(`Rejection handled: ${promise}`);
    });
    process.on('uncaughtException', (error: Error) => {
      logger.error(`Caught exception: ${error}`);
    });
    process.on('warning', (warning: any) => {
      logger.error(`Process warning: ${warning.name}\nMessage: ${warning.message}\nStack trace:\n${warning.trace}`);
    });
  }
}
