import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from 'src/types/user.type';

interface JWTRequest extends Request {
  user?: User;
}

export const jwtMiddleware = (req: JWTRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access denied' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as User;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};