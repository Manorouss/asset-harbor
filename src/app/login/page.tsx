'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);
    setIsLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${isLogin ? 'login' : 'register'}`);
      }

      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(data));
        router.push('/');
        return;
      }

      setIsLogin(true);
      setPassword('');
      setIsSuccess(true);
      setMessage('Registration successful. Please log in.');
    } catch (err: unknown) {
      setIsSuccess(false);
      setMessage(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
            Concept Manufacturing
          </p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">The Asset Manager</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? 'Sign in to the live workspace, or open the read-only demo.' : 'Create an account for the live workspace.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {message && (
            <p className={`text-center text-sm ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          <div className="space-y-3">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/demo">Open Demo Access</Link>
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
              setIsSuccess(false);
            }}
            className="ml-1 font-semibold text-blue-600 hover:underline"
            type="button"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
