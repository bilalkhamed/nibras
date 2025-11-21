'use client';

import { useActionState } from 'react';
import { login } from './actions';
import { useFormStatus } from 'react-dom';

export default function LoginPage() {
  const [state, loginAction] = useActionState(login, undefined);
  const { pending } = useFormStatus();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        className="w-full max-w-sm space-y-4"
        action={loginAction}
        noValidate
      >
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            ايميل
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            باسورد
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        {state?.error && <p className="text-destructive">{state.error}</p>}
        <button
          type="submit"
          className="w-full rounded bg-black px-4 py-2 text-white"
          disabled={pending}
        >
          Login
        </button>
      </form>
    </div>
  );
}
