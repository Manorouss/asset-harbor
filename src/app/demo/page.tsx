'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileImage, FileText, Film, Folder, FolderOpen, Search, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { demoTree, flattenDemoAssets, type DemoAsset } from '@/lib/demo-data';

const openedFolders = new Set(['customers', 'sales', 'marketing', 'product-assets']);

function DemoTreeItem({
  asset,
  selectedId,
  onSelect,
  query,
}: {
  asset: DemoAsset;
  selectedId: string;
  onSelect: (_asset: DemoAsset) => void;
  query: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const matches = asset.name.toLowerCase().includes(normalizedQuery);
  const childMatches =
    asset.children?.some(
      (child) =>
        child.name.toLowerCase().includes(normalizedQuery) ||
        child.children?.some((nestedChild) => nestedChild.name.toLowerCase().includes(normalizedQuery))
    ) ?? false;

  if (normalizedQuery && !matches && !childMatches) {
    return null;
  }

  if (asset.type === 'folder') {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700">
          {openedFolders.has(asset.id) ? <FolderOpen className="h-4 w-4 text-[#173540]" /> : <Folder className="h-4 w-4 text-[#173540]" />}
          <span className="font-medium">{asset.name}</span>
        </div>
        <div className="ml-3 space-y-1 border-l border-slate-200 pl-3">
          {(asset.children ?? []).map((child) => (
            <DemoTreeItem key={child.id} asset={child} selectedId={selectedId} onSelect={onSelect} query={query} />
          ))}
        </div>
      </div>
    );
  }

  const Icon = asset.type === 'image' ? FileImage : asset.type === 'video' ? Film : FileText;

  return (
    <button
      type="button"
      onClick={() => onSelect(asset)}
      className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition ${
        selectedId === asset.id ? 'bg-[#173540] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="truncate">{asset.name}</span>
    </button>
  );
}

export default function DemoPage() {
  const demoAssets = useMemo(() => flattenDemoAssets(demoTree), []);
  const [query, setQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<DemoAsset>(demoAssets[3] ?? demoAssets[0]);

  const visibleAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return demoAssets;
    }

    return demoAssets.filter((asset) => asset.name.toLowerCase().includes(normalizedQuery));
  }, [demoAssets, query]);

  const reviewSummary = selectedAsset.reviews ?? { positive: 0, neutral: 0, negative: 0 };
  const totalReviews = reviewSummary.positive + reviewSummary.neutral + reviewSummary.negative;

  return (
    <main className="min-h-screen bg-[#f5f1ea] text-slate-900">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Public walkthrough</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Asset Manager demo</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-800">
              <Shield className="h-3.5 w-3.5" />
              Read-only sample data
            </div>
            <Button asChild variant="outline" className="border-slate-300 bg-white">
              <Link href="/login">
                <ArrowLeft className="h-4 w-4" />
                Back to access page
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-5 py-5 sm:px-8">
        <div className="mb-5 grid gap-4 rounded-[2rem] bg-[#173540] px-6 py-6 text-white lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">What visitors should notice</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight">
              The product organizes asset review around folders, previews, ratings, and discussion in one surface.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              'Browse a structured asset tree',
              'Review a file with visible team sentiment',
              'See how comments stay attached to the asset',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 text-sm text-white/85">
                <CheckCircle2 className="h-4 w-4 text-[#ffd5b2]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
          <aside className="rounded-[2rem] bg-white p-4 shadow-[0_20px_60px_rgba(23,53,64,0.08)]">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Workspace</p>
              <h3 className="mt-1 text-lg font-semibold">Demo asset tree</h3>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search demo assets"
                  className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-10"
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {demoTree.map((asset) => (
                <DemoTreeItem
                  key={asset.id}
                  asset={asset}
                  selectedId={selectedAsset.id}
                  onSelect={setSelectedAsset}
                  query={query}
                />
              ))}
            </div>
          </aside>

          <section className="rounded-[2rem] bg-white p-4 shadow-[0_20px_60px_rgba(23,53,64,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Selected asset</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">{selectedAsset.name}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{selectedAsset.description}</p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{selectedAsset.status}</div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="rounded-[1.75rem] bg-[#f6f0e7] p-4">
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                  {selectedAsset.preview ? (
                    <Image
                      src={selectedAsset.preview}
                      alt={selectedAsset.name}
                      className="h-[500px] w-full object-cover"
                      width={1200}
                      height={900}
                    />
                  ) : (
                    <div className="flex h-[500px] items-center justify-center text-slate-500">No preview available.</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] bg-slate-100 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Review mix</p>
                  <div className="mt-4 grid gap-3">
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span className="text-sm text-slate-600">Positive</span>
                      <span className="text-lg font-semibold text-emerald-700">{reviewSummary.positive}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span className="text-sm text-slate-600">Neutral</span>
                      <span className="text-lg font-semibold text-amber-700">{reviewSummary.neutral}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span className="text-sm text-slate-600">Negative</span>
                      <span className="text-lg font-semibold text-rose-700">{reviewSummary.negative}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">{totalReviews} ratings captured</p>
                </div>

                <div className="rounded-[1.5rem] bg-[#173540] p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/60">Use case</p>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    Teams can review creative work, product sheets, or launch collateral without losing the folder context around the file.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Visible in this demo</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>Asset selection and preview</li>
                    <li>Aggregated review sentiment</li>
                    <li>Per-asset discussion history</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] bg-white p-4 shadow-[0_20px_60px_rgba(23,53,64,0.08)]">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Comments</p>
              <h3 className="mt-1 text-lg font-semibold">Attached discussion</h3>
            </div>
            <div className="mt-4 space-y-3">
              {(selectedAsset.comments ?? []).map((comment) => (
                <div key={comment.id} className="rounded-[1.5rem] bg-slate-100 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{comment.author}</span>
                    <span className="text-xs uppercase tracking-[0.24em] text-slate-500">{comment.time}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{comment.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Why read-only</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The live application is backed by private Dropbox content. This public route demonstrates the workflow without exposing customer assets or internal credentials.
              </p>
            </div>

            <div className="mt-4 rounded-[1.5rem] bg-[#c96f3b] p-4 text-white">
              <p className="text-xs uppercase tracking-[0.28em] text-white/70">Next step</p>
              <p className="mt-3 text-sm leading-6 text-white/85">
                Use the live workspace for authenticated team review, or share this walkthrough when you need to show the concept publicly.
              </p>
            </div>
          </aside>
        </div>

        {visibleAssets.length === 0 && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            No demo assets matched that search term.
          </div>
        )}
      </div>
    </main>
  );
}
