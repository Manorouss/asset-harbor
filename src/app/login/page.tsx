'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, FileImage, FolderTree, MessageSquareText, ShieldCheck, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const featureHighlights = [
  {
    icon: FolderTree,
    title: 'Structured team browsing',
    description: 'Navigate customer, sales, marketing, and product folders from one workspace.',
  },
  {
    icon: Star,
    title: 'Fast review signals',
    description: 'Capture positive, neutral, and negative feedback directly on each asset.',
  },
  {
    icon: MessageSquareText,
    title: 'Contextual collaboration',
    description: 'Comments and reactions stay attached to the asset so decisions remain traceable.',
  },
];

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
      setIsSuccess(true);
      setMessage('Account created. Log in to open the workspace.');
      setPassword('');
    } catch (err: unknown) {
      setIsSuccess(false);
      setMessage(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#ece7df] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_40%),linear-gradient(135deg,#173540_0%,#1d4350_38%,#c96f3b_100%)] px-6 py-8 text-white sm:px-10 lg:px-14 lg:py-12">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_45%,rgba(255,255,255,0.02))]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Concept Manufacturing</p>
                <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Asset reviews that feel like a working studio, not a spreadsheet.
                </h1>
              </div>
              <div className="hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur lg:block">
                Beta workspace
              </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div className="space-y-6">
                <p className="max-w-md text-base leading-7 text-white/80">
                  The Asset Manager helps teams browse shared Dropbox libraries, rate files, and keep review notes attached to the work itself.
                </p>

                <div className="space-y-4">
                  {featureHighlights.map(({ icon: Icon, title, description }) => (
                    <div key={title} className="border-t border-white/15 pt-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-[#ffd5b2]" />
                        <p className="text-sm font-medium tracking-wide text-white">{title}</p>
                      </div>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">{description}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild className="bg-white text-slate-950 hover:bg-white/90">
                    <Link href="/demo">
                      View Read-Only Demo
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                    <Link href="https://github.com/Manorouss/asset-rating-app" target="_blank" rel="noreferrer">
                      View GitHub Repo
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/15 bg-black/20 p-4 shadow-2xl shadow-black/20 backdrop-blur-md">
                <div className="rounded-[1.5rem] bg-[#f5efe6] p-4 text-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
                      <h2 className="mt-1 text-lg font-semibold">Live review workflow</h2>
                    </div>
                    <div className="rounded-full bg-[#173540] px-3 py-1 text-xs font-medium text-white">Read / rate / discuss</div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="space-y-2 rounded-[1.25rem] bg-white p-3 shadow-sm">
                      <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Asset tree</div>
                      {['1 - Customers', '2 - Sales', '4 - Product Assets'].map((item, index) => (
                        <div
                          key={item}
                          className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm ${
                            index === 2 ? 'bg-[#173540] text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span>{item}</span>
                          <span>{index === 2 ? '3 files' : 'open'}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 rounded-[1.25rem] bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Selected file</p>
                          <h3 className="mt-1 text-base font-semibold">Packaging concepts v3</h3>
                        </div>
                        <FileImage className="h-5 w-5 text-[#c96f3b]" />
                      </div>
                      <div className="rounded-[1.25rem] bg-[linear-gradient(160deg,#e4ddd4,#f9f6f1)] p-4">
                        <Image
                          src="/demo/packaging-concepts.svg"
                          alt="Packaging concept preview"
                          className="h-56 w-full rounded-[1rem] border border-slate-200 object-cover"
                          width={1200}
                          height={900}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1rem] bg-slate-100 p-3">
                          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Sentiment</p>
                          <p className="mt-2 text-2xl">😊</p>
                          <p className="mt-1 text-sm text-slate-600">2 positive, 1 neutral</p>
                        </div>
                        <div className="rounded-[1rem] bg-slate-100 p-3">
                          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Latest note</p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            Keep this direction, but tighten the logo lockup before approval.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-[#f7f3ee] px-6 py-8 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure workspace access
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                {isLogin ? 'Sign in to the live workspace' : 'Create a collaborator account'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Public visitors can use the read-only demo. Team members can sign in here to use the live Dropbox-backed review workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 border-slate-300 bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-slate-300 bg-white"
                  required
                />
              </div>

              {message && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    isSuccess
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-rose-300 bg-rose-50 text-rose-800'
                  }`}
                >
                  {message}
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="h-12 w-full bg-[#173540] text-white hover:bg-[#1f4653]">
                {isLoading ? 'Processing...' : isLogin ? 'Enter Workspace' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                  setIsSuccess(false);
                }}
                className="font-medium text-slate-900 underline underline-offset-4"
                type="button"
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
              </button>
              <Link href="/demo" className="font-medium text-[#173540] underline underline-offset-4">
                Explore the demo instead
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
