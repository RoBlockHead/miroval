// deno-lint-ignore-file no-explicit-any
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}
export class Logger {
  public logLevel: LogLevel;
  constructor(logLevel?: LogLevel) {
    this.logLevel = logLevel || LogLevel.INFO;
  }
  public debug(...args: any[]) {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.log(...args);
    }
  }
  public info(...args: any[]) {
    if (this.logLevel <= LogLevel.INFO) {
      console.log(...args);
    }
  }
  public warn(...args: any[]) {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(...args);
    }
  }
  public error(...args: any[]) {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(...args);
    }
  }
  public fatal(...args: any[]) {
    if (this.logLevel <= LogLevel.FATAL) {
      console.error(...args);
    }
  }
}