declare module 'multer' {
  import { Request } from 'express';
  import { Readable } from 'stream';
  
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
    stream: Readable;
    buffer: Buffer;
  }
  
  interface StorageEngine {
    _handleFile(req: Request, file: File, callback: (error?: any, info?: Partial<File>) => void): void;
    _removeFile(req: Request, file: File, callback: (error: Error) => void): void;
  }
  
  interface MulterOptions {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    fileFilter?: (req: Request, file: File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
  }
  
  interface Instance {
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: Array<{ name: string; maxCount?: number }>): any;
    none(): any;
    any(): any;
  }
  
  interface DiskStorageOptions {
    destination?: string | ((req: Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
    filename?: (req: Request, file: File, callback: (error: Error | null, filename: string) => void) => void;
  }
  
  interface DiskStorage extends StorageEngine {
    _handleFile(req: Request, file: File, callback: (error?: any, info?: Partial<File>) => void): void;
    _removeFile(req: Request, file: File, callback: (error: Error) => void): void;
  }
  
  interface Multer {
    (options?: MulterOptions): Instance;
    diskStorage(options: DiskStorageOptions): DiskStorage;
  }
  
  const multer: Multer;
  export = multer;
  export { File };
} 