'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import postgres from 'postgres';
import { signIn } from '../../../auth';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

const CreateInvoice = z.object({
  customerId: z.string(),
  amount: z.number(),
  status: z.string(),
});

export async function createInvoice(formData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: Number(formData.get('amount')),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath('/dashboard/invoices');
}





