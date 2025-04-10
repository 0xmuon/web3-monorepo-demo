declare module 'body-parser' {
  import { Request, Response, NextFunction } from 'express';
  
  interface Options {
    inflate?: boolean;
    limit?: number | string;
    type?: string | string[] | ((req: Request) => boolean);
    verify?: (req: Request, res: Response, buf: Buffer, encoding: string) => void;
  }
  
  function json(options?: Options): (req: Request, res: Response, next: NextFunction) => void;
  function urlencoded(options?: Options): (req: Request, res: Response, next: NextFunction) => void;
  function raw(options?: Options): (req: Request, res: Response, next: NextFunction) => void;
  function text(options?: Options): (req: Request, res: Response, next: NextFunction) => void;
  
  export default {
    json,
    urlencoded,
    raw,
    text
  };
} 