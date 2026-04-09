'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  Image as ImageIcon,
  LogIn,
  MessageSquare,
  Moon,
  Sun,
  Video,
} from 'lucide-react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { demoTree, flattenDemoAssets, type DemoAsset } from '@/lib/demo-data';

type DemoFilters = {
  name: string;
  type: 'all' | 'image' | 'video' | 'pdf';
  hasNegativeRating: boolean;
  hasComments: boolean;
  hasAnyRating: boolean;
};

function DemoTreeItem({
  node,
  selectedAsset,
  onSelectAsset,
}: {
  node: DemoAsset;
  selectedAsset: DemoAsset | null;
  onSelectAsset: (_asset: DemoAsset) => void;
}) {
  const isFolder = node.type === 'folder';

  if (isFolder) {
    return (
      <div>
        <div className="flex items-center rounded-md p-1 text-sm text-gray-800 dark:text-gray-100">
          <div className="w-6 text-gray-500">
            <ChevronDown className="h-4 w-4" />
          </div>
          <Folder className="mr-2 h-5 w-5 text-blue-500" />
          <span>{node.name}</span>
        </div>
        <div className="ml-3 border-l border-gray-200 pl-5 dark:border-gray-700">
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
      className={`flex w-full items-center rounded-md p-1 text-left text-sm transition-colors ${
        selectedAsset?.id === node.id
          ? 'bg-blue-100 dark:bg-blue-900/50'
          : 'text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800'
      }`}
      onClick={() => onSelectAsset(node)}
    >
      <div className="w-6 text-gray-500">
        <ChevronRight className="h-4 w-4 opacity-0" />
      </div>
      <File className="mr-2 h-5 w-5 text-gray-400" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export default function DemoPage() {
  const [selectedAsset, setSelectedAsset] = useState<DemoAsset | null>(flattenDemoAssets(demoTree)[0] ?? null);
  const [darkMode, setDarkMode] = useState(false);
  const [userFilter, setUserFilter] = useState('');
  const [filters, setFilters] = useState<DemoFilters>({
    name: '',
    type: 'all',
    hasNegativeRating: false,
    hasComments: false,
    hasAnyRating: false,
  });

  const allAssets = useMemo(() => flattenDemoAssets(demoTree), []);

  const userOptions = useMemo(() => {
    const usernames = new Set<string>();
    allAssets.forEach((asset) => {
      (asset.comments ?? []).forEach((comment) => usernames.add(comment.author));
    });
    return [...usernames].sort();
  }, [allAssets]);

  const filteredList = useMemo(() => {
    return allAssets.filter((asset) => {
      const matchesName = asset.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesType = filters.type === 'all' || asset.type === filters.type;
      const hasAnyRating = !!asset.reviews && asset.reviews.positive + asset.reviews.neutral + asset.reviews.negative > 0;
      const hasNegativeRating = !!asset.reviews && asset.reviews.negative > 0;
      const hasComments = (asset.comments?.length ?? 0) > 0;
      const matchesUser =
        !userFilter || (asset.comments ?? []).some((comment) => comment.author === userFilter);

      if (!matchesName || !matchesType || !matchesUser) {
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
  }, [allAssets, filters, userFilter]);

  const showFilteredList = filters.hasAnyRating || filters.hasNegativeRating || filters.hasComments || !!filters.name || filters.type !== 'all' || !!userFilter;

  const ratings = selectedAsset?.reviews ?? { positive: 0, neutral: 0, negative: 0 };
  const totalRatings = ratings.positive + ratings.neutral + ratings.negative;

  const previewIcon =
    selectedAsset?.type === 'image' ? (
      <ImageIcon className="h-16 w-16 text-gray-300" />
    ) : selectedAsset?.type === 'video' ? (
      <Video className="h-16 w-16 text-gray-300" />
    ) : (
      <File className="h-16 w-16 text-gray-300" />
    );

  return (
    <main className={`${darkMode ? 'dark' : ''}`}>
      <div className="h-screen w-screen overflow-hidden bg-gray-50 text-black dark:bg-black dark:text-white">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-6 dark:bg-gray-950">
          <h1 className="text-lg font-semibold">
            <b>The Asset Manager</b> <span>(Demo)</span> - <i>Concept Manufacturing</i>
          </h1>
          <button
            className="ml-4 rounded-full p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-800"
            onClick={() => setDarkMode((value) => !value)}
            aria-label="Toggle dark mode"
            type="button"
          >
            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-700" />}
          </button>
          <div className="ml-auto flex items-center gap-4">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-700 dark:bg-blue-950 dark:text-blue-200">
              Read-only demo
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, Demo Visitor</span>
            <Button asChild variant="ghost" size="icon">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                <span className="sr-only">Go to login</span>
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex items-center gap-4 border-b bg-white p-3 dark:bg-gray-950">
          <Input
            placeholder="Filter by name..."
            className="max-w-xs"
            value={filters.name}
            onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
          />
          <div className="flex items-center gap-2">
            <Label htmlFor="type-filter">File Type</Label>
            <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value as DemoFilters['type'] }))}>
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
            <Label htmlFor="user-filter">User</Label>
            <Select value={userFilter || '__all__'} onValueChange={(value) => setUserFilter(value === '__all__' ? '' : value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Users</SelectItem>
                {userOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex items-center space-x-2">
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

        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-7rem)]">
          <ResizablePanel defaultSize={25} minSize={18} maxSize={40}>
            <div className="flex h-full flex-col">
              <h2 className="border-b p-4 text-lg font-semibold">Assets</h2>
              <ScrollArea className="flex-1 p-2">
                {showFilteredList ? (
                  filteredList.length > 0 ? (
                    filteredList.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        className={`flex w-full items-center rounded-md p-1 text-left text-sm transition-colors ${
                          selectedAsset?.id === asset.id
                            ? 'bg-blue-100 dark:bg-blue-900/50'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <File className="mr-2 h-5 w-5 text-gray-400" />
                        <span className="truncate">{asset.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500">No demo assets match the current filters.</div>
                  )
                ) : (
                  demoTree.map((node) => (
                    <DemoTreeItem
                      key={node.id}
                      node={node}
                      selectedAsset={selectedAsset}
                      onSelectAsset={setSelectedAsset}
                    />
                  ))
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-gray-900">
              {!selectedAsset ? (
                <div className="text-gray-500">{previewIcon}</div>
              ) : selectedAsset.preview ? (
                <div className="flex h-full w-full items-center justify-center p-6">
                  <div className="w-full max-w-5xl overflow-hidden rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    <Image
                      src={selectedAsset.preview}
                      alt={selectedAsset.name}
                      width={1200}
                      height={900}
                      className="h-auto w-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  {previewIcon}
                  <p>No preview available.</p>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={25} minSize={18} maxSize={40}>
            <div className="flex h-full flex-col">
              {!selectedAsset ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-500">
                  <MessageSquare className="h-16 w-16 opacity-30" />
                  <p className="mt-4">Select an asset to see details</p>
                </div>
              ) : (
                <>
                  <div className="shrink-0 border-b p-4">
                    <h3 className="truncate text-lg font-semibold" title={selectedAsset.name}>
                      {selectedAsset.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{selectedAsset.description}</p>
                  </div>

                  <div className="shrink-0 space-y-4 border-b p-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Demo Rating</h4>
                      <div className="flex items-center gap-3 text-3xl">
                        <span className={ratings.positive > 0 ? '' : 'opacity-40'}>😊</span>
                        <span className={ratings.neutral > 0 ? '' : 'opacity-40'}>😐</span>
                        <span className={ratings.negative > 0 ? '' : 'opacity-40'}>😞</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-medium">All Ratings ({totalRatings})</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center justify-between">
                          <span>Positive</span>
                          <span>{ratings.positive}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Neutral</span>
                          <span>{ratings.neutral}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Negative</span>
                          <span>{ratings.negative}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1">
                    <h3 className="shrink-0 border-b p-4 font-semibold">
                      Comments ({selectedAsset.comments?.length ?? 0})
                    </h3>
                    <ScrollArea className="h-[calc(100%-3.5rem)]">
                      <div className="space-y-4 p-4">
                        {(selectedAsset.comments ?? []).map((comment) => (
                          <div key={comment.id} className="flex items-start gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold dark:bg-gray-700">
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{comment.author}</span>
                                <span className="text-xs text-gray-500">{comment.time}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                                {comment.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
