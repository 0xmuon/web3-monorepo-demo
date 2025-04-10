declare module 'express' {
  export interface Request {
    body: any;
    params: any;
    query: any;
    headers: any;
    file?: Express.Multer.File;
  }

  export interface Response {
    status: (code: number) => Response;
    json: (body: any) => Response;
    send: (body: any) => Response;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface Router {
    get: (path: string, ...handlers: ((req: Request, res: Response, next: NextFunction) => void)[]) => Router;
    post: (path: string, ...handlers: ((req: Request, res: Response, next: NextFunction) => void)[]) => Router;
    put: (path: string, ...handlers: ((req: Request, res: Response, next: NextFunction) => void)[]) => Router;
    delete: (path: string, ...handlers: ((req: Request, res: Response, next: NextFunction) => void)[]) => Router;
    use: (path: string | ((req: Request, res: Response, next: NextFunction) => void), handler?: (req: Request, res: Response, next: NextFunction) => void) => Router;
    (req: Request, res: Response, next: NextFunction): void;
  }

  export interface Express {
    (): Express;
    use: (path: string | Router | ((req: Request, res: Response, next: NextFunction) => void) | ((err: Error, req: Request, res: Response, next: NextFunction) => void), handler?: Router | ((req: Request, res: Response, next: NextFunction) => void)) => Express;
    listen: (port: number | string, callback?: () => void) => any;
    static: (root: string) => any;
    Router: () => Router;
  }

  const express: Express;
  export default express;
} 