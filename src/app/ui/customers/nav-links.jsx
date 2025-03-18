'use client';

import React from 'react';
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import NavLinks from './nav-links';

// Update these links to match the exact routes you have in your application
const links = [
  { name: 'Home', href: '/ui/dashboard', icon: HomeIcon },
  { name: 'Invoices', href: '/ui/invoices', icon: DocumentDuplicateIcon },
  { name: 'Customers', href: '/ui/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav>
      {links.map((link) => {
        const LinkIcon = link.icon;
        // Check if the current route exactly matches this link
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              // Base styling for the nav links
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                // Add highlight if active
                'bg-sky-100 text-blue-600': isActive,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <span className="hidden md:block">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
