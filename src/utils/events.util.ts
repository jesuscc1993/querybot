import { OutputUtil } from './output.util';

export class EventsUtil {
  public static setupHandlers() {
    const unhandledRejections: Map<Promise<any>, string> = new Map();
    process.on('exit', (exitCode: number) => {
      OutputUtil.error(`Forced exit of code: ${exitCode}`);
    });
    process.on('unhandledRejection', (reason: string, promise: Promise<any>) => {
      unhandledRejections.set(promise, reason);
      OutputUtil.error(`Unhandled rejection: ${promise} ${reason}`);
    });
    process.on('rejectionHandled', (promise: Promise<any>) => {
      unhandledRejections.delete(promise);
      OutputUtil.error(`Rejection handled: ${promise}`);
    });
    process.on('uncaughtException', (error: Error) => {
      OutputUtil.error(`Caught exception: ${error}`);
    });
    process.on('warning', (warning: any) => {
      OutputUtil.error(`Process warning: ${warning.name}\nMessage: ${warning.message}\nStack trace:\n${warning.trace}`);
    });
  }
}