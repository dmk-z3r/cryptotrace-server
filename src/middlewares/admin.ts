import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const accessKey = req.header('access-key');
  if (!accessKey || accessKey !== process.env.ADMIN_ACCESS_KEY) {
    res.status(401).json({ message: 'Access denied' });
    return;
  }
  next();
}