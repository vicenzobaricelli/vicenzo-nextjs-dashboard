'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authenticate } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="rounded-lg bg-gray-50 px-6 pb-6 pt-8">
        <h1 className="mb-4 text-2xl font-semibold">Log in to continue</h1>

        {/* Email Field */}
        <Field label="Email" id="email" type="email" icon={AtSymbolIcon} required />

        {/* Password Field */}
        <Field label="Password" id="password" type="password" icon={KeyIcon} required minLength={6} />

        <input type="hidden" name="redirectTo" value={callbackUrl} />
        
        <Button className="mt-6 w-full flex items-center justify-center" aria-disabled={isPending}>
          Log in <ArrowRightIcon className="ml-2 h-5 w-5 text-gray-50" />
        </Button>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-red-500" aria-live="polite">
            <ExclamationCircleIcon className="h-5 w-5" />
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </form>
  );
}

function Field({ label, id, type, icon: Icon, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-900" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          className="peer block w-full rounded-md border border-gray-300 py-2 pl-10 text-sm outline-none placeholder-gray-500 focus:ring-2 focus:ring-gray-900"
          id={id}
          name={id}
          type={type}
          placeholder={`Enter your ${label.toLowerCase()}`}
          {...props}
        />
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
      </div>
    </div>
  );
}

