import { Request, Response, Handler } from 'express';

declare namespace ExpressMongoSanitize {
  interface Options {
    replaceWith?: string;
    onSanitize?: (params: { key: string; req: Request }) => void;
    dryRun?: boolean;
    allowDots?: boolean;
  }
}

type Middleware = {
  /**
   * Create middleware instance
   * @param options
   */
  (options?: ExpressMongoSanitize.Options): Handler;
  /**
   * Remove any keys containing prohibited characters
   * @param target
   * @param options
   */
  sanitize<T extends Record<string, unknown> | unknown[]>(
    target: T,
    options?: ExpressMongoSanitize.Options,
  ): T;
  /**
   * Check if the payload has keys with prohibited characters‘
   * @param target
   */
  has(
    target: Record<string, unknown> | unknown[],
    allowDots?: boolean,
  ): boolean;
};

declare const ExpressMongoSanitize: Middleware & {
  default: typeof ExpressMongoSanitize;
};

export = ExpressMongoSanitize;
