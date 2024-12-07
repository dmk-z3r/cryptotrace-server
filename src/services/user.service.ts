import { UserModel, AccessApplicationModel } from '../models/user.model';
import { sendEmail } from '../utils/email';
import { accessRequestTemplate, loginAlertTemplate, accessGrantedTemplate, newAccessRequestTemplate } from '../utils/templates';
import { AccessRequest, User } from '../types/user.type';
import logger from '..//utils/logger';
import bcrypt from 'bcrypt';
export const findUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email });
};

const createUser = async (userData: User) => {
  const user = new UserModel(userData);
  await user.save();
  return user;
};

export const sendLoginAlert = async (user: User, ipAddress: string) => {
  try {
    await sendEmail(
      user.email,
      'Login Alert',
      `Hello, ${user.name}! Your account was just logged into.`,
      loginAlertTemplate(ipAddress)
    );
  } catch (error) {
    logger.error('Failed to send login alert email:', error);
    throw new Error('Failed to send login alert email');
  }
  return;
}

export const sendAccessRequestAlert = async (application: AccessRequest) => {
  try {
    await sendEmail(
      process.env.ADMIN_EMAIL!,
      'Access Request Alert',
      'A new access request was submitted.',
      accessRequestTemplate(application.name, application.email, application.agency, application.role, application.reason)
    );

    await sendEmail(
      application.email,
      'Access Request Submitted',
      'Your access request was submitted.',
      newAccessRequestTemplate(application.name, application.email, application.agency, application.role, application.reason)
    );
  } catch (error) {
    logger.error('Failed to send access request alert email:', error);
    throw new Error('Failed to send access request alert email');
  }
  return;
}

const sendAccessGrantedAlert = async (application: AccessRequest, password: string) => {
  try {
    await sendEmail(
      application.email,
      'Access Granted',
      'Your access request was approved.',
      accessGrantedTemplate(application.name, password)
    );
  } catch (error) {
    logger.error('Failed to send access granted alert email:', error);
    throw new Error('Failed to send access granted alert email');
  }
  return;
}

export const submitAccessRequest = async (application: AccessRequest) => {
  const newApplication = new AccessApplicationModel(application);
  try {
    await newApplication.save();
    await sendAccessRequestAlert(application);
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error('Email already exists');
    }
    logger.error('Failed to submit access request:', error);
    throw new Error('Failed to submit access request');
  }
  return;
}

export const getAccessRequests = async () => {
  return await AccessApplicationModel.find();
}

export const getAccessRequest = async (applicationId: string) => {
  return await AccessApplicationModel.findById(applicationId);
}

import mongoose from 'mongoose';

export const acceptRejectApplication = async (applicationId: string, status: string) => {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new Error('Invalid application ID');
  }

  const session = await AccessApplicationModel.startSession();
  session.startTransaction();
  try {
    const application = await AccessApplicationModel.findById(applicationId).session(session);
    if (!application) {
      throw new Error('Application not found');
    }
    application.status = status == 'approved' ? 'approved' : 'rejected';
    await application.save();

    if (status === 'approved') {
      const existingUser = await findUserByEmail(application.email);
      if (!existingUser) {
        const password = Math.random().toString(36).slice(-8);

        const user: User = {
          name: application.name,
          email: application.email,
          agency: application.agency,
          role: application.role,
          password: bcrypt.hashSync(password, 10),
        };

        await createUser(user);
        await sendAccessGrantedAlert(application, password);
      }
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to accept/reject application:', error);
    throw new Error('Failed to accept/reject application');
  } finally {
    session.endSession();
  }
  return;
}