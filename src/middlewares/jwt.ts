import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from 'src/types/user.type';

export interface JWTRequest extends Request {
  user: User;
}

export const jwtMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User;
    (req as JWTRequest).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.', error: err });
  }
}