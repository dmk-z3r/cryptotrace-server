export interface Report {
  id?: number;
  title: string;
  type: string;
  createdDate?: string;
  status: 'Pending' | 'Completed';
  content: any;
}