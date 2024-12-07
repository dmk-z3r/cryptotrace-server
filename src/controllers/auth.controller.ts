import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model';
import * as authService from '../services/user.service';
import logger from '../utils/logger';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        agency: user.agency,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '10h' }
    );

    const ipAddress = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    authService.sendLoginAlert(user, ipAddress[0]);

    res.json({ token });
    return;
  } catch (error: any) {
    logger.error(`Error logging in: ${error}`);
    res.status(500).json({ error: error.message });
    return;
  }
};

export const requestAccess = async (req: Request, res: Response) => {
  try {
    const { name, email, agency, role, reason } = req.body;
    if (!name || !email || !agency || !role || !reason) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }
    const status = 'pending';
    await authService.submitAccessRequest({ name, email, agency, role, reason, status });
    res.status(200).json({ message: 'Access request submitted' });
    return;
  } catch (error: any) {
    logger.error(`Error submitting access request: ${error}`);
    res.status(500).json({ error: error.message });
    return;
  }
};

export const approveRejectAccessRequest = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;
    await authService.acceptRejectApplication(id, status);
    res.status(200).json({ message: 'Access request updated' });
    return;
  } catch (error) {
    logger.error(`Error updating access request: ${error}`);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};