export type User = {
  id: string;
  email: string;
  password: string;
  name?: string; // Optional field
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number; // Stored in cents
  status: 'pending' | 'paid';
  date: string;
};

  