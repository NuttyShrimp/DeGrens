declare type PendingUploadData =
  | {
      type: 'string';
      cb: (fPath: string) => void;
    }
  | {
      type: 'buffer';
      cb: (fBuffer?: Buffer, err?: string) => void;
    };

declare interface UploadRequest {
  encoding: 'jpg' | 'png' | 'webp';
  headers: Record<string, string>;
  crop?: { offsetX: number; offsetY: number; width: number; height: number };
  trim?: boolean;

  // The id where the callback on the client for the result from the targetURL is waiting for
  correlation: string;

  // endpoint where return of targetURL request to text needs to be sent to
  resultURL?: string;

  // An endpoint that can be hit to upload the image data and
  targetURL: string;
  // The field where the image data needs to be sent under in the Multipart form
  targetField: string;
}
