export interface User {
  name: string;
  email: string;
  password: string;
  agency: string;
  role: string;
}

export interface AccessRequest extends Omit<User, 'password'> {
  reason: string;
  status: string;
}