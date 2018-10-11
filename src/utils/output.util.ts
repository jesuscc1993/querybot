export class OutputUtil {

  private static outputEnabled: boolean;

  public static configure(outputEnabled: boolean): void {
    this.outputEnabled = outputEnabled;
  }

  public static outputError(error: Error, functionName: string, ...parameters: any): Function {
    let errorMessage: string = `${error} thrown`;
    if (functionName) errorMessage += ` when calling ${functionName}`;
    if (parameters) errorMessage += ` with parameters ${parameters}`;

    return (error: Error) => {
      this.error(errorMessage);
    };
  }

  public static log(message: string): void {
    if (this.outputEnabled) {
      console.log(message);
    }
  }

  public static error(error: Error | any): void {
    console.error(error);
  }

}