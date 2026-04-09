'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDeferredValue, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cloud,
  File,
  Image as ImageIcon,
  LogIn,
  MessageSquare,
  Moon,
  PlayCircle,
  RefreshCw,
  Sun,
  Video,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  demoCloudConnections,
  demoTree,
  flattenDemoAssets,
  type DemoAsset,
  type DemoCloud,
} from '@/lib/demo-data';
import { cn } from '@/lib/utils';

const allDemoAssets = flattenDemoAssets(demoTree);
const defaultSelectedAsset = allDemoAssets.find((asset) => asset.type === 'video') ?? allDemoAssets[0] ?? null;

type DemoFilters = {
  name: string;
  type: 'all' | 'image' | 'video' | 'pdf';
  source: 'all' | DemoCloud;
  hasNegativeRating: boolean;
  hasComments: boolean;
  hasAnyRating: boolean;
};

type InspectorTab = 'feedback' | 'details' | 'activity';

const cloudToneMap: Record<DemoCloud, { badge: string; dot: string; accent: string; soft: string }> = {
  Dropbox: {
    badge: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-200',
    dot: 'bg-sky-500',
    accent: 'text-sky-600 dark:text-sky-300',
    soft: 'bg-sky-100 dark:bg-sky-950/60',
  },
  'Google Drive': {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200',
    dot: 'bg-emerald-500',
    accent: 'text-emerald-600 dark:text-emerald-300',
    soft: 'bg-emerald-100 dark:bg-emerald-950/60',
  },
  OneDrive: {
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200',
    dot: 'bg-indigo-500',
    accent: 'text-indigo-600 dark:text-indigo-300',
    soft: 'bg-indigo-100 dark:bg-indigo-950/60',
  },
};

function CloudBadge({ source, className }: { source: DemoCloud; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium',
        cloudToneMap[source].badge,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', cloudToneMap[source].dot)} />
      {source}
    </span>
  );
}

function StatusBadge({ status }: { status: NonNullable<DemoAsset['status']> }) {
  const tone =
    status === 'Approved'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
      : status === 'Needs Work'
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
        : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200';

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-medium', tone)}>
      {status}
    </span>
  );
}

function AssetTypeIcon({ type }: { type: DemoAsset['type'] }) {
  if (type === 'image') {
    return <ImageIcon className="h-4 w-4" />;
  }

  if (type === 'video') {
    return <Video className="h-4 w-4" />;
  }

  return <File className="h-4 w-4" />;
}

function DemoTreeItem({
  node,
  selectedAsset,
  onSelectAsset,
}: {
  node: DemoAsset;
  selectedAsset: DemoAsset | null;
  onSelectAsset: (_asset: DemoAsset) => void;
}) {
  if (node.type === 'folder') {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-800 dark:text-zinc-100">
          <ChevronDown className="h-4 w-4 text-zinc-400" />
          <Cloud className={cn('h-4 w-4', node.source ? cloudToneMap[node.source].accent : 'text-zinc-400')} />
          <span className="font-medium">{node.name}</span>
          {node.source ? <CloudBadge source={node.source} className="ml-auto" /> : null}
        </div>
        <div className="ml-4 border-l border-zinc-200 pl-3 dark:border-zinc-800">
          {(node.children ?? []).map((child) => (
            <DemoTreeItem
              key={child.id}
              node={child}
              selectedAsset={selectedAsset}
              onSelectAsset={onSelectAsset}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectAsset(node)}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
        selectedAsset?.id === node.id
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
          : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900'
      )}
    >
      <ChevronRight className="h-4 w-4 opacity-0" />
      <AssetTypeIcon type={node.type} />
      <span className="min-w-0 flex-1 truncate">{node.name}</span>
      {node.source ? <CloudBadge source={node.source} /> : null}
    </button>
  );
}

export default function DemoPage() {
  const [selectedAsset, setSelectedAsset] = useState<DemoAsset | null>(defaultSelectedAsset);
  const [darkMode, setDarkMode] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('feedback');
  const [userFilter, setUserFilter] = useState('');
  const [filters, setFilters] = useState<DemoFilters>({
    name: '',
    type: 'all',
    source: 'all',
    hasNegativeRating: false,
    hasComments: false,
    hasAnyRating: false,
  });

  const deferredName = useDeferredValue(filters.name);

  const userOptions = useMemo(() => {
    const usernames = new Set<string>();
    allDemoAssets.forEach((asset) => {
      (asset.comments ?? []).forEach((comment) => usernames.add(comment.author));
    });
    return [...usernames].sort();
  }, []);

  const pendingAssets = useMemo(() => {
    const statusRank = { 'Needs Work': 0, 'In Review': 1, Approved: 2 } as const;
    return [...allDemoAssets]
      .filter((asset) => asset.status !== 'Approved')
      .toSorted((a, b) => statusRank[a.status ?? 'Approved'] - statusRank[b.status ?? 'Approved']);
  }, []);

  const filteredList = useMemo(() => {
    return allDemoAssets.filter((asset) => {
      const matchesName = asset.name.toLowerCase().includes(deferredName.toLowerCase());
      const matchesType = filters.type === 'all' || asset.type === filters.type;
      const matchesSource = filters.source === 'all' || asset.source === filters.source;
      const matchesUser = !userFilter || (asset.comments ?? []).some((comment) => comment.author === userFilter);
      const hasAnyRating =
        !!asset.reviews && asset.reviews.positive + asset.reviews.neutral + asset.reviews.negative > 0;
      const hasNegativeRating = !!asset.reviews && asset.reviews.negative > 0;
      const hasComments = (asset.comments?.length ?? 0) > 0;

      if (!matchesName || !matchesType || !matchesSource || !matchesUser) {
        return false;
      }

      if (filters.hasAnyRating && !hasAnyRating) {
        return false;
      }

      if (filters.hasNegativeRating && !hasNegativeRating) {
        return false;
      }

      if (filters.hasComments && !hasComments) {
        return false;
      }

      return true;
    });
  }, [deferredName, filters, userFilter]);

  const showFilteredList =
    !!filters.name ||
    filters.type !== 'all' ||
    filters.source !== 'all' ||
    !!userFilter ||
    filters.hasAnyRating ||
    filters.hasNegativeRating ||
    filters.hasComments;

  const reviewCounts = selectedAsset?.reviews ?? { positive: 0, neutral: 0, negative: 0 };
  const totalRatings = reviewCounts.positive + reviewCounts.neutral + reviewCounts.negative;
  const totalAssets = allDemoAssets.length;
  const awaitingReview = pendingAssets.length;

  const previewIcon =
    selectedAsset?.type === 'image' ? (
      <ImageIcon className="h-16 w-16 text-zinc-300" />
    ) : selectedAsset?.type === 'video' ? (
      <PlayCircle className="h-16 w-16 text-zinc-300" />
    ) : (
      <File className="h-16 w-16 text-zinc-300" />
    );

  return (
    <main className={darkMode ? 'dark' : ''}>
      <div className="h-screen w-screen overflow-hidden bg-stone-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
        <header className="flex h-14 items-center gap-4 border-b border-zinc-200 bg-white px-6 dark:border-zinc-900 dark:bg-zinc-950">
          <h1 className="text-lg font-semibold">
            <b>The Asset Manager</b> <span>(Demo)</span> - <i>Concept Manufacturing</i>
          </h1>
          <button
            className="rounded-full p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
            onClick={() => setDarkMode((value) => !value)}
            aria-label="Toggle dark mode"
            type="button"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-zinc-600" />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white dark:bg-white dark:text-zinc-950">
              Read-only demo
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Welcome, Demo Visitor</span>
            <Button asChild variant="ghost" size="icon">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                <span className="sr-only">Go to login</span>
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-50 px-6 py-3 text-sm dark:border-zinc-900 dark:bg-zinc-950">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Connected Clouds</p>
            <p className="mt-1 font-semibold">{demoCloudConnections.length} clouds connected</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Unified Workspace</p>
            <p className="mt-1 font-semibold">{totalAssets} assets indexed in one review queue</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Actionable Review</p>
            <p className="mt-1 font-semibold">{awaitingReview} assets still need review decisions</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-900 dark:bg-zinc-950">
          <Input
            placeholder="Filter by name..."
            className="max-w-xs"
            value={filters.name}
            onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
          />
          <div className="flex items-center gap-2">
            <Label htmlFor="type-filter">File Type</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value as DemoFilters['type'] }))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="File type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="source-filter">Source</Label>
            <Select
              value={filters.source}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, source: value as DemoFilters['source'] }))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clouds</SelectItem>
                <SelectItem value="Dropbox">Dropbox</SelectItem>
                <SelectItem value="Google Drive">Google Drive</SelectItem>
                <SelectItem value="OneDrive">OneDrive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="user-filter">Reviewer</Label>
            <Select value={userFilter || '__all__'} onValueChange={(value) => setUserFilter(value === '__all__' ? '' : value)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Reviewers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Reviewers</SelectItem>
                {userOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="any-rating-filter"
                checked={filters.hasAnyRating}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, hasAnyRating: checked }))}
              />
              <Label htmlFor="any-rating-filter">Has Any Rating</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="negative-rating-filter"
                checked={filters.hasNegativeRating}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, hasNegativeRating: checked }))}
              />
              <Label htmlFor="negative-rating-filter">Has Negative Rating</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="comments-filter"
                checked={filters.hasComments}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, hasComments: checked }))}
              />
              <Label htmlFor="comments-filter">Has Comments</Label>
            </div>
          </div>
        </div>

        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-9.5rem)]">
          <ResizablePanel defaultSize={28} minSize={22} maxSize={38}>
            <div className="flex h-full flex-col border-r border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-950">
              <div className="shrink-0 border-b border-zinc-200 p-4 dark:border-zinc-900">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  <Cloud className="h-3.5 w-3.5" />
                  Connected Clouds
                </div>
                <div className="mt-3 space-y-2">
                  {demoCloudConnections.map((connection) => {
                    const assetCount = allDemoAssets.filter((asset) => asset.source === connection.name).length;
                    return (
                      <div
                        key={connection.id}
                        className={cn(
                          'rounded-xl border px-3 py-3',
                          connection.status === 'Connected'
                            ? 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60'
                            : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <CloudBadge source={connection.name} />
                          <span className="text-[11px] uppercase tracking-wide text-zinc-500">
                            {connection.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium">{connection.account}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {assetCount} demo assets indexed, {connection.syncedToday} sync events today
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 border-b border-zinc-200 p-4 dark:border-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Unified Review Queue</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      Mixed assets from every cloud, sorted by what still needs decisions.
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium dark:bg-zinc-900">
                    {pendingAssets.length}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {pendingAssets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setInspectorTab('feedback');
                      }}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                        selectedAsset?.id === asset.id
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                          : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900'
                      )}
                    >
                      <div className="mt-0.5">
                        <AssetTypeIcon type={asset.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{asset.name}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {asset.source ? <CloudBadge source={asset.source} /> : null}
                          {asset.status ? <StatusBadge status={asset.status} /> : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1">
                <div className="shrink-0 border-b border-zinc-200 px-4 py-3 dark:border-zinc-900">
                  <h2 className="text-lg font-semibold">Assets</h2>
                </div>
                <ScrollArea className="h-[calc(100%-3.75rem)]">
                  <div className="space-y-4 p-3">
                    {showFilteredList ? (
                      filteredList.length > 0 ? (
                        filteredList.map((asset) => (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setInspectorTab('feedback');
                            }}
                            className={cn(
                              'flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                              selectedAsset?.id === asset.id
                                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                                : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900'
                            )}
                          >
                            <div className="mt-0.5">
                              <AssetTypeIcon type={asset.type} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{asset.name}</div>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                {asset.source ? <CloudBadge source={asset.source} /> : null}
                                {asset.status ? <StatusBadge status={asset.status} /> : null}
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-800">
                          No demo assets match the current filters.
                        </div>
                      )
                    ) : (
                      demoTree.map((node) => (
                        <DemoTreeItem
                          key={node.id}
                          node={node}
                          selectedAsset={selectedAsset}
                          onSelectAsset={(asset) => {
                            setSelectedAsset(asset);
                            setInspectorTab('feedback');
                          }}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={44} minSize={30}>
            <div className="flex h-full flex-col bg-stone-100 dark:bg-zinc-900">
              {!selectedAsset ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-500">
                  {previewIcon}
                  <p>Select an asset from the unified queue.</p>
                </div>
              ) : (
                <>
                  <div className="shrink-0 border-b border-zinc-200 bg-white/90 px-5 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Unified Preview</p>
                        <h2 className="mt-1 text-xl font-semibold">{selectedAsset.name}</h2>
                        <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
                          {selectedAsset.description}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          Original path: {selectedAsset.sourcePath}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedAsset.source ? <CloudBadge source={selectedAsset.source} /> : null}
                        {selectedAsset.status ? <StatusBadge status={selectedAsset.status} /> : null}
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 p-6">
                    <div className="flex h-full flex-col rounded-[22px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                      <div className="shrink-0 border-b border-zinc-200 px-5 py-3 text-sm text-zinc-500 dark:border-zinc-800">
                        Reviewing one asset at a time, regardless of whether it came from Dropbox, Google Drive, or OneDrive.
                      </div>
                      <div className="min-h-0 flex-1">
                        {selectedAsset.preview ? (
                          <div className="flex h-full items-center justify-center p-6">
                            <Image
                              src={selectedAsset.preview}
                              alt={selectedAsset.name}
                              width={1200}
                              height={900}
                              className="max-h-full w-full rounded-2xl border border-zinc-200 object-contain dark:border-zinc-800"
                            />
                          </div>
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-500">
                            {previewIcon}
                            <p>No preview available.</p>
                          </div>
                        )}
                      </div>
                      {selectedAsset.type === 'video' && (selectedAsset.comments ?? []).some((comment) => comment.anchor) ? (
                        <div className="shrink-0 border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Video Review Markers</p>
                            <p className="text-xs text-zinc-500">Timecoded comments stay attached to the asset.</p>
                          </div>
                          <div className="relative mt-4 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                            {(selectedAsset.comments ?? [])
                              .filter((comment) => typeof comment.markerPercent === 'number')
                              .map((comment) => (
                                <div
                                  key={comment.id}
                                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-zinc-950 shadow-sm dark:border-zinc-950 dark:bg-white"
                                  style={{ left: `${comment.markerPercent}%` }}
                                  title={`${comment.anchor} ${comment.content}`}
                                />
                              ))}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(selectedAsset.comments ?? [])
                              .filter((comment) => comment.anchor)
                              .map((comment) => (
                                <span
                                  key={comment.id}
                                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                                >
                                  {comment.anchor} {comment.author}
                                </span>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={28} minSize={22} maxSize={38}>
            <div className="flex h-full flex-col border-l border-zinc-200 bg-white dark:border-zinc-900 dark:bg-zinc-950">
              {!selectedAsset ? (
                <div className="flex h-full flex-col items-center justify-center text-zinc-500">
                  <MessageSquare className="h-16 w-16 opacity-30" />
                  <p className="mt-4">Select an asset to see details.</p>
                </div>
              ) : (
                <>
                  <div className="shrink-0 border-b border-zinc-200 px-4 py-4 dark:border-zinc-900">
                    <h3 className="truncate text-lg font-semibold" title={selectedAsset.name}>
                      {selectedAsset.name}
                    </h3>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{selectedAsset.campaign}</p>
                  </div>

                  <div className="shrink-0 border-b border-zinc-200 p-2 dark:border-zinc-900">
                    <div className="flex gap-2">
                      {(['feedback', 'details', 'activity'] as InspectorTab[]).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setInspectorTab(tab)}
                          className={cn(
                            'rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                            inspectorTab === tab
                              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                              : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="min-h-0 flex-1">
                    <ScrollArea className="h-full">
                      {inspectorTab === 'feedback' ? (
                        <div className="space-y-5 p-4">
                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <p className="text-sm font-medium">Ratings</p>
                            <div className="mt-3 flex items-center gap-3 text-3xl">
                              <span className={reviewCounts.positive > 0 ? '' : 'opacity-30'}>😊</span>
                              <span className={reviewCounts.neutral > 0 ? '' : 'opacity-30'}>😐</span>
                              <span className={reviewCounts.negative > 0 ? '' : 'opacity-30'}>😞</span>
                            </div>
                            <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                              <div className="flex items-center justify-between">
                                <span>Positive</span>
                                <span>{reviewCounts.positive}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Neutral</span>
                                <span>{reviewCounts.neutral}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Negative</span>
                                <span>{reviewCounts.negative}</span>
                              </div>
                            </div>
                            <p className="mt-4 text-xs text-zinc-500">
                              {totalRatings} total ratings captured across the shared review queue.
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold">Comments</h4>
                              <span className="text-xs text-zinc-500">
                                {selectedAsset.comments?.length ?? 0} attached to this asset
                              </span>
                            </div>
                            <div className="mt-3 space-y-3">
                              {(selectedAsset.comments ?? []).map((comment) => (
                                <div key={comment.id} className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold">{comment.author}</span>
                                    <span className="text-xs text-zinc-500">{comment.time}</span>
                                    {comment.anchor ? (
                                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium dark:bg-zinc-900">
                                        {comment.anchor}
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                                    {comment.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {inspectorTab === 'details' ? (
                        <div className="space-y-5 p-4">
                          <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                            <p className="text-sm font-semibold">Asset Metadata</p>
                            <div className="mt-4 space-y-3 text-sm">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-zinc-500">Source cloud</span>
                                {selectedAsset.source ? <CloudBadge source={selectedAsset.source} /> : <span>-</span>}
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-zinc-500">Original path</span>
                                <span className="max-w-[220px] text-right text-zinc-700 dark:text-zinc-300">
                                  {selectedAsset.sourcePath}
                                </span>
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-zinc-500">Last synced</span>
                                <span>{selectedAsset.syncedAt}</span>
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-zinc-500">Synced by</span>
                                <span>{selectedAsset.syncedBy}</span>
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-zinc-500">Version</span>
                                <span>{selectedAsset.version}</span>
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-zinc-500">Owner</span>
                                <span>{selectedAsset.owner}</span>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              <p className="text-sm font-semibold">Why this matters in the demo</p>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                              This asset keeps its original cloud source and path, but review, ratings, and comments
                              now live in one workspace. That is the product story the demo needs to prove.
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {inspectorTab === 'activity' ? (
                        <div className="space-y-4 p-4">
                          {(selectedAsset.activity ?? []).map((entry) => (
                            <div key={entry.id} className="flex gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                              <div className="mt-1 rounded-full bg-zinc-100 p-2 dark:bg-zinc-900">
                                {entry.author.includes('connector') ? (
                                  <RefreshCw className="h-4 w-4" />
                                ) : (
                                  <MessageSquare className="h-4 w-4" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold">
                                    {entry.author} {entry.action}
                                  </p>
                                  <span className="text-xs text-zinc-500">{entry.time}</span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                                  {entry.detail}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}
