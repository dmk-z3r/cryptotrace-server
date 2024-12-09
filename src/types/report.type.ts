export interface Report {
  title: string;
  type: string;
  createdDate?: string;
  status: 'Pending' | 'Completed';
  content: any;
}