import { sql } from '@vercel/postgres';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

// Simulated delay for testing dynamic data fetching
const SIMULATED_DELAY_MS = 3000;

// FETCH REVENUE (WITH SLOW FETCH SIMULATION)
export async function fetchRevenue() {
  noStore(); // Prevents caching
  try {
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS)); // Simulate delay
    const data = await sql`SELECT * FROM revenue`;
    console.log('Data fetch completed after 3 seconds.');
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// FETCH CARD DATA (Total Invoices, Customers, Collected, Pending)
export async function fetchCardData() {
  noStore();
  try {
    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      sql`SELECT COUNT(*) AS count FROM invoices`,
      sql`SELECT COUNT(*) AS count FROM customers`,
      sql`
        SELECT
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS paid,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS pending
        FROM invoices`
    ]);

    return {
      numberOfInvoices: Number(invoiceCount.rows[0].count ?? '0'),
      numberOfCustomers: Number(customerCount.rows[0].count ?? '0'),
      totalPaidInvoices: formatCurrency(invoiceStatus.rows[0].paid ?? '0'),
      totalPendingInvoices: formatCurrency(invoiceStatus.rows[0].pending ?? '0'),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

// FETCH LATEST INVOICES (Top 5 Most Recent)
export async function fetchLatestInvoices() {
  noStore();
  try {
    const data = await sql`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5
    `;

    return data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

// PAGINATION CONSTANT
const ITEMS_PER_PAGE = 6;

// FETCH FILTERED INVOICES (Paginated)
export async function fetchFilteredInvoices(query, currentPage) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const invoices = await sql`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

// FETCH TOTAL NUMBER OF PAGES FOR INVOICES
export async function fetchInvoicesPages(query) {
  noStore();
  try {
    const count = await sql`
      SELECT COUNT(*) AS total
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
    `;

    return Math.ceil(Number(count.rows[0].total) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

// FETCH SINGLE INVOICE BY ID
export async function fetchInvoiceById(id) {
  noStore();
  try {
    const data = await sql`
      SELECT invoices.id, invoices.customer_id, invoices.amount, invoices.status
      FROM invoices
      WHERE invoices.id = ${id}
    `;

    return {
      ...data.rows[0],
      amount: data.rows[0]?.amount / 100, // Convert cents to dollars
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

// FETCH CUSTOMERS (Sorted Alphabetically)
export async function fetchCustomers() {
  noStore();
  try {
    const data = await sql`SELECT id, name FROM customers ORDER BY name ASC`;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all customers.');
  }
}

// FETCH FILTERED CUSTOMERS (Searchable)
export async function fetchFilteredCustomers(query) {
  noStore();
  try {
    const data = await sql`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC
    `;

    return data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer table.');
  }
}

// FETCH USER BY EMAIL
export async function getUser(email) {
  noStore();
  try {
    const user = await sql`SELECT * FROM users WHERE email = ${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

