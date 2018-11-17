import { Logger } from "winston";

export class OutputUtil {

  public static outputError(logger: Logger, error: Error, functionName: string, ...parameters: any): Function {
    let errorMessage: string = `${error} thrown`;
    if (functionName) errorMessage += ` when calling ${functionName}`;
    if (parameters) errorMessage += ` with parameters ${parameters}`;

    return (error: any) => {
      logger.error(error);
    };
  }

}