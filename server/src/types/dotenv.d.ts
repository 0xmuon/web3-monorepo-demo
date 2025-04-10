declare module 'dotenv' {
  interface DotenvConfigOptions {
    path?: string;
    encoding?: string;
    debug?: boolean;
  }
  
  function config(options?: DotenvConfigOptions): {
    parsed: { [key: string]: string };
    error?: Error;
  };
  
  export default {
    config
  };
} 