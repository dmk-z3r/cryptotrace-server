export interface Database {
  id: number;
  name: string;
  records: number;
  lastUpdated: string;
  status: 'Active' | 'Inactive';
  data: any;
}
