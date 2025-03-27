import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { fetchInvoicesPages } from '@/app/lib/data';

export default async function Page({
  searchParams = {},
}: {
  searchParams?: { query?: string; page?: string };
}) {
  // Extract search parameters from the URL
  const query = searchParams.query || '';
  const currentPage = Number(searchParams.page) || 1;

  // Fetch the total number of pages dynamically
  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="w-full">
      {/* Page Heading */}
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>

      {/* Search Bar & Create Invoice Button */}
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>

      {/* Invoice Table with Suspense Loading */}
      <Suspense key={`${query}-${currentPage}`} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>

      {/* Pagination Component */}
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}


