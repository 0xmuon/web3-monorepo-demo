   // src/express.d.ts
   import * as multer from "multer";
   import { Request } from "express";

   declare global {
     namespace Express {
       interface Request {
         file?: multer.File; // Add this line
         files?: multer.File[]; // If you're using multiple files
       }
     }
   }