import 'express';

declare global {
  namespace Express {
    interface Response {
      ok: <T>(data: T, message?: string) => Response;
      created: <T>(data: T, message?: string) => Response;
      noContent: (message?: string) => Response;
    }
  }
}