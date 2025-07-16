declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }
  }
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface JwtUser {
  id: string;
  email: string;
}
