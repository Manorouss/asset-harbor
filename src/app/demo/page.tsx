'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  Image as ImageIcon,
  LoaderCircle,
  LogIn,
  MessageSquare,
  Moon,
  RefreshCw,
  SendHorizontal,
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { demoTree, flattenDemoAssets, type DemoAsset, type DemoCloud, type DemoComment } from '@/lib/demo-data';
import { cn } from '@/lib/utils';

type DemoFilters = {
  name: string;
  type: 'all' | 'image' | 'video' | 'pdf';
  source: 'all' | DemoCloud;
  hasNegativeRating: boolean;
  hasComments: boolean;
  hasAnyRating: boolean;
};

const reactionEmojis = ['👍', '❤️', '😂', '😮', '👀'];
const demoAppName = 'Asset Harbor';

type DemoRatingKey = 'positive' | 'neutral' | 'negative';
type DemoReviews = { positive: number; neutral: number; negative: number };

const emptyReviews: DemoReviews = { positive: 0, neutral: 0, negative: 0 };

function flattenComments(comments: DemoComment[]): DemoComment[] {
  return comments.flatMap((comment) => [comment, ...flattenComments(comment.replies ?? [])]);
}

function countComments(comments: DemoComment[]): number {
  return comments.reduce((total, comment) => total + 1 + countComments(comment.replies ?? []), 0);
}

function updateCommentThread(
  comments: DemoComment[],
  targetId: number,
  updater: (_comment: DemoComment) => DemoComment
): DemoComment[] {
  return comments.map((comment) => {
    if (comment.id === targetId) {
      return updater(comment);
    }

    if (!comment.replies?.length) {
      return comment;
    }

    return {
      ...comment,
      replies: updateCommentThread(comment.replies, targetId, updater),
    };
  });
}

function appendReplyToThread(comments: DemoComment[], parentId: number, reply: DemoComment): DemoComment[] {
  return comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies ?? []), reply],
      };
    }

    if (!comment.replies?.length) {
      return comment;
    }

    return {
      ...comment,
      replies: appendReplyToThread(comment.replies, parentId, reply),
    };
  });
}

function DropboxIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7.2 4 2 7.35l5.2 3.34 5.2-3.34L7.2 4Zm9.6 0-5.2 3.35 5.2 3.34L22 7.35 16.8 4ZM2 14.05l5.2 3.35 5.2-3.35-5.2-3.34L2 14.05Zm14.8-3.34-5.2 3.34 5.2 3.35 5.2-3.35-5.2-3.34ZM12.39 18.07l-5.19-3.34L2 18.08l5.2 3.34 5.19-3.35Zm0 0" fill="#0A7CFF" />
    </svg>
  );
}

function GoogleDriveIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8.46 3 1.8 14.52h5.18L13.64 3H8.46Z" fill="#0F9D58" />
      <path d="m14.16 3 6.65 11.52h-5.17L8.98 3h5.18Z" fill="#FFC107" />
      <path d="m6.98 15.02-2.62 4.53A2 2 0 0 0 6.09 22h11.82a2 2 0 0 0 1.73-1l2.62-4.53H6.98Z" fill="#4285F4" />
    </svg>
  );
}

function OneDriveIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9.1 10.1a5.2 5.2 0 0 1 9.58 1.84A3.88 3.88 0 0 1 18.12 20H7.53A4.53 4.53 0 0 1 7 11.02a4.8 4.8 0 0 1 2.1-.91Z" fill="#2563EB" />
    </svg>
  );
}

function ICloudIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7.75 18.5a3.75 3.75 0 0 1-.42-7.48 5.26 5.26 0 0 1 10.27 1.42h.15a3.06 3.06 0 1 1 0 6.12H7.75Z" fill="#9CA3AF" />
      <path d="M7.75 17.4h10a1.97 1.97 0 1 0-.2-3.93l-.86.08-.08-.87a4.16 4.16 0 0 0-8.22-.83l-.2.8-.82.07a2.65 2.65 0 0 0 .18 5.29Z" fill="#E5E7EB" />
    </svg>
  );
}

function CloudIcon({ source, className = 'h-4 w-4' }: { source: DemoCloud; className?: string }) {
  if (source === 'Dropbox') return <DropboxIcon className={className} />;
  if (source === 'Google Drive') return <GoogleDriveIcon className={className} />;
  if (source === 'OneDrive') return <OneDriveIcon className={className} />;
  return <ICloudIcon className={className} />;
}

function AssetTypeIcon({ type }: { type: DemoAsset['type'] }) {
  if (type === 'image') {
    return <ImageIcon className="h-4 w-4 text-gray-400" />;
  }

  if (type === 'video') {
    return <Video className="h-4 w-4 text-gray-400" />;
  }

  return <File className="h-4 w-4 text-gray-400" />;
}

function CloudPill({ source }: { source: DemoCloud }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <CloudIcon source={source} className="h-3 w-3" />
      {source}
    </span>
  );
}

function DemoTreeItem({
  node,
  selectedAsset,
  onSelectAsset,
  expandedIds,
  onToggleFolder,
}: {
  node: DemoAsset;
  selectedAsset: DemoAsset | null;
  onSelectAsset: (_asset: DemoAsset) => void;
  expandedIds: Set<string>;
  onToggleFolder: (_folderId: string) => void;
}) {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedIds.has(node.id);

  if (isFolder) {
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggleFolder(node.id)}
          className="flex w-full items-center rounded-md p-1 text-sm text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          <div className="w-6 text-gray-500">
            <ChevronDown
              className={cn('h-4 w-4 transition-transform duration-200', isExpanded ? 'rotate-0' : '-rotate-90')}
            />
          </div>
          {node.source ? (
            <CloudIcon source={node.source} className="mr-2 h-4 w-4" />
          ) : (
            <Folder className="mr-2 h-4 w-4 text-[#4F8EF7]" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              key={`${node.id}-children`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="ml-3 border-l border-gray-200 pl-5 dark:border-gray-700">
                {(node.children ?? []).map((child) => (
                  <DemoTreeItem
                    key={child.id}
                    node={child}
                    selectedAsset={selectedAsset}
                    onSelectAsset={onSelectAsset}
                    expandedIds={expandedIds}
                    onToggleFolder={onToggleFolder}
                  />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2 rounded-md p-1 text-left text-sm transition-colors',
        selectedAsset?.id === node.id
          ? 'bg-blue-100 dark:bg-blue-900/50'
          : 'text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800'
      )}
      onClick={() => onSelectAsset(node)}
    >
      <div className="w-6 text-gray-500">
        <ChevronRight className="h-4 w-4 opacity-0" />
      </div>
      <AssetTypeIcon type={node.type} />
      <span className="truncate">{node.name}</span>
      {node.source ? <CloudPill source={node.source} /> : null}
    </button>
  );
}

export default function DemoPage() {
  const allAssets = useMemo(() => flattenDemoAssets(demoTree), []);
  const [selectedAsset, setSelectedAsset] = useState<DemoAsset | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => new Set());
  const [commentsByAsset, setCommentsByAsset] = useState<Record<string, DemoComment[]>>(() =>
    Object.fromEntries(allAssets.map((asset) => [asset.id, asset.comments ?? []]))
  );
  const [reviewsByAsset, setReviewsByAsset] = useState<Record<string, DemoReviews>>(() =>
    Object.fromEntries(allAssets.map((asset) => [asset.id, asset.reviews ?? emptyReviews]))
  );
  const [visitorRatingsByAsset, setVisitorRatingsByAsset] = useState<Record<string, DemoRatingKey | null>>({});
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [filters, setFilters] = useState<DemoFilters>({
    name: '',
    type: 'all',
    source: 'all',
    hasNegativeRating: false,
    hasComments: false,
    hasAnyRating: false,
  });

  const userOptions = useMemo(() => {
    const usernames = new Set<string>();
    allAssets.forEach((asset) => {
      flattenComments(commentsByAsset[asset.id] ?? []).forEach((comment) => usernames.add(comment.author));
    });
    return [...usernames].sort();
  }, [allAssets, commentsByAsset]);

  const filteredList = useMemo(() => {
    return allAssets.filter((asset) => {
      const assetComments = commentsByAsset[asset.id] ?? [];
      const matchesName = asset.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesType = filters.type === 'all' || asset.type === filters.type;
      const matchesSource = filters.source === 'all' || asset.source === filters.source;
      const assetReviews = reviewsByAsset[asset.id] ?? emptyReviews;
      const flattenedComments = flattenComments(assetComments);
      const hasAnyRating = assetReviews.positive + assetReviews.neutral + assetReviews.negative > 0;
      const hasNegativeRating = assetReviews.negative > 0;
      const hasComments = assetComments.length > 0;
      const matchesUser = !userFilter || flattenedComments.some((comment) => comment.author === userFilter);

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
  }, [allAssets, commentsByAsset, filters, reviewsByAsset, userFilter]);

  const showFilteredList =
    !!filters.name ||
    filters.type !== 'all' ||
    filters.source !== 'all' ||
    !!userFilter ||
    filters.hasAnyRating ||
    filters.hasNegativeRating ||
    filters.hasComments;

  const ratings = selectedAsset ? reviewsByAsset[selectedAsset.id] ?? emptyReviews : emptyReviews;
  const totalRatings = ratings.positive + ratings.neutral + ratings.negative;
  const currentComments = selectedAsset ? commentsByAsset[selectedAsset.id] ?? [] : [];
  const totalCommentCount = countComments(currentComments);
  const currentVisitorRating = selectedAsset ? visitorRatingsByAsset[selectedAsset.id] ?? null : null;

  const previewIcon =
    selectedAsset?.type === 'image' ? (
      <ImageIcon className="h-16 w-16 text-gray-300" />
    ) : selectedAsset?.type === 'video' ? (
      <Video className="h-16 w-16 text-gray-300" />
    ) : (
      <File className="h-16 w-16 text-gray-300" />
    );

  function toggleFolder(folderId: string) {
    setExpandedFolderIds((current) => {
      const next = new Set(current);

      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }

      return next;
    });
  }

  function addEmojiToComposer(emoji: string) {
    setNewComment((current) => `${current}${current ? ' ' : ''}${emoji}`);
  }

  function handleSelectAsset(asset: DemoAsset) {
    setSelectedAsset(asset);
    setDetailsExpanded(false);
    setCommentsExpanded(true);
    setReplyingToId(null);
    setNewComment('');
  }

  function handleAssetRating(nextRating: DemoRatingKey) {
    if (!selectedAsset) {
      return;
    }

    const assetId = selectedAsset.id;
    const previousRating = visitorRatingsByAsset[assetId] ?? null;

    setReviewsByAsset((current) => {
      const currentReviews = current[assetId] ?? emptyReviews;
      const nextReviews = { ...currentReviews };

      if (previousRating) {
        nextReviews[previousRating] = Math.max(0, nextReviews[previousRating] - 1);
      }

      if (previousRating !== nextRating) {
        nextReviews[nextRating] += 1;
      }

      return {
        ...current,
        [assetId]: nextReviews,
      };
    });

    setVisitorRatingsByAsset((current) => ({
      ...current,
      [assetId]: previousRating === nextRating ? null : nextRating,
    }));
  }

  async function handleCommentSubmit() {
    if (!selectedAsset || !newComment.trim() || isSendingComment) {
      return;
    }

    setIsSendingComment(true);
    await new Promise((resolve) => setTimeout(resolve, 220));

    const nextComment: DemoComment = {
      id: Date.now(),
      author: 'Demo Visitor',
      content: newComment.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
    };

    setCommentsByAsset((current) => ({
      ...current,
      [selectedAsset.id]: [...(current[selectedAsset.id] ?? []), nextComment],
    }));
    setNewComment('');
    setIsSendingComment(false);
  }

  async function handleReplySubmit(parentId: number) {
    if (!selectedAsset) {
      return;
    }

    const draft = replyDrafts[parentId]?.trim();
    if (!draft) {
      return;
    }

    const reply: DemoComment = {
      id: Date.now(),
      author: 'Demo Visitor',
      content: draft,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: [],
    };

    setCommentsByAsset((current) => ({
      ...current,
      [selectedAsset.id]: appendReplyToThread(current[selectedAsset.id] ?? [], parentId, reply),
    }));
    setReplyDrafts((current) => ({ ...current, [parentId]: '' }));
    setReplyingToId(null);
  }

  function handleReaction(commentId: number, emoji: string) {
    if (!selectedAsset) {
      return;
    }

    setCommentsByAsset((current) => {
      const updated = updateCommentThread(current[selectedAsset.id] ?? [], commentId, (comment) => {
        const existing = comment.reactions ?? [];
        const reactionIndex = existing.findIndex((reaction) => reaction.emoji === emoji);

        if (reactionIndex === -1) {
          return {
            ...comment,
            reactions: [...existing, { emoji, users: ['Demo Visitor'] }],
          };
        }

        const nextReactions = [...existing];
        const target = nextReactions[reactionIndex];
        const hasUser = target.users.includes('Demo Visitor');

        if (hasUser) {
          const nextUsers = target.users.filter((user) => user !== 'Demo Visitor');

          if (nextUsers.length === 0) {
            nextReactions.splice(reactionIndex, 1);
          } else {
            nextReactions[reactionIndex] = { ...target, users: nextUsers };
          }
        } else {
          nextReactions[reactionIndex] = { ...target, users: [...target.users, 'Demo Visitor'] };
        }

        return {
          ...comment,
          reactions: nextReactions,
        };
      });

      return {
        ...current,
        [selectedAsset.id]: updated,
      };
    });
  }

  function renderComment(comment: DemoComment, depth = 0) {
    const isReplying = replyingToId === comment.id;

    return (
      <div key={comment.id} className={cn('space-y-3', depth > 0 && 'ml-6 border-l border-gray-200 pl-4 dark:border-gray-800')}>
        <div className="group flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold dark:bg-gray-700">
            {comment.author.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{comment.author}</span>
              <span className="text-xs text-gray-500">{comment.time}</span>
              {comment.anchor ? (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {comment.anchor}
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">
              {comment.content}
            </div>
            {comment.reactions?.length ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {comment.reactions.map((reaction) => (
                  <button
                    key={`${comment.id}-${reaction.emoji}`}
                    type="button"
                    onClick={() => handleReaction(comment.id, reaction.emoji)}
                    className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.users.length}</span>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setReplyingToId((current) => (current === comment.id ? null : comment.id))}
                className="rounded-full px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                Reply
              </button>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {reactionEmojis.map((emoji) => (
                  <button
                    key={`${comment.id}-${emoji}-action`}
                    type="button"
                    onClick={() => handleReaction(comment.id, emoji)}
                    className="rounded-full px-1.5 py-1 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            {isReplying ? (
              <div className="mt-3 flex items-start gap-2">
                <Textarea
                  placeholder={`Reply to ${comment.author}...`}
                  value={replyDrafts[comment.id] ?? ''}
                  onChange={(event) =>
                    setReplyDrafts((current) => ({ ...current, [comment.id]: event.target.value }))
                  }
                  className="min-h-[72px] resize-none bg-gray-100 text-sm dark:bg-gray-800"
                />
                <Button type="button" size="icon" onClick={() => handleReplySubmit(comment.id)}>
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        {comment.replies?.length ? (
          <div className="space-y-3">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main className={darkMode ? 'dark' : ''}>
      <div className="h-screen w-screen overflow-hidden bg-gray-50 text-black dark:bg-black dark:text-white">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-6 dark:bg-gray-950">
          <h1 className="text-lg font-semibold">
            <b>{demoAppName}</b> <span>(Demo)</span>
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
            <span className="text-sm text-gray-500 dark:text-gray-400">4 clouds connected</span>
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
            <Label htmlFor="source-filter">Cloud</Label>
            <Select
              value={filters.source}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, source: value as DemoFilters['source'] }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Clouds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clouds</SelectItem>
                <SelectItem value="Dropbox">Dropbox</SelectItem>
                <SelectItem value="Google Drive">Google Drive</SelectItem>
                <SelectItem value="OneDrive">OneDrive</SelectItem>
                <SelectItem value="iCloud Drive">iCloud Drive</SelectItem>
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

        <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-7rem)] min-h-0">
          <ResizablePanel defaultSize={25} minSize={18} maxSize={40}>
            <div className="flex h-full min-h-0 flex-col">
              <h2 className="border-b p-4 text-lg font-semibold">Assets</h2>
              <ScrollArea className="flex-1 p-2">
                {showFilteredList ? (
                  filteredList.length > 0 ? (
                    filteredList.map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md p-1 text-left text-sm transition-colors',
                          selectedAsset?.id === asset.id
                            ? 'bg-blue-100 dark:bg-blue-900/50'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                        onClick={() => handleSelectAsset(asset)}
                      >
                        <AssetTypeIcon type={asset.type} />
                        <span className="truncate">{asset.name}</span>
                        {asset.source ? <CloudPill source={asset.source} /> : null}
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
                      onSelectAsset={handleSelectAsset}
                      expandedIds={expandedFolderIds}
                      onToggleFolder={toggleFolder}
                    />
                  ))
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex h-full min-h-0 items-center justify-center bg-gray-100 dark:bg-gray-900">
              {!selectedAsset ? (
                <div className="max-w-md text-center text-gray-500">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm dark:bg-gray-950">
                    {previewIcon}
                  </div>
                  <p className="mt-5 text-lg font-medium text-gray-700 dark:text-gray-200">Choose a file to preview</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    The cloud roots now open collapsed so visitors can test the Finder-style tree from a clean state.
                  </p>
                </div>
              ) : selectedAsset.preview ? (
                <div className="flex h-full w-full items-center justify-center p-6">
                  <div className="w-full max-w-5xl overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.10)] dark:border-gray-800 dark:bg-gray-950">
                    <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-[#F7F4EE] px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedAsset.name}</p>
                        <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                          {selectedAsset.sourcePath ?? selectedAsset.description}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2 text-[11px]">
                        {selectedAsset.source ? <CloudPill source={selectedAsset.source} /> : null}
                        {selectedAsset.version ? (
                          <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
                            {selectedAsset.version}
                          </span>
                        ) : null}
                        {selectedAsset.status ? (
                          <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
                            {selectedAsset.status}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="bg-[#ECE7DF] p-5 dark:bg-black">
                      <Image
                        src={selectedAsset.preview}
                        alt={selectedAsset.name}
                        width={1200}
                        height={900}
                        className="h-auto w-full rounded-[18px] border border-black/5 bg-white object-contain"
                      />
                    </div>
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
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              {!selectedAsset ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-500">
                  <MessageSquare className="h-16 w-16 opacity-30" />
                  <p className="mt-4">Select an asset to see details</p>
                </div>
              ) : (
                <>
                  <div className="shrink-0 border-b px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold" title={selectedAsset.name}>
                          {selectedAsset.name}
                        </h3>
                        <p className="mt-1 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                          {selectedAsset.description}
                        </p>
                      </div>
                      {selectedAsset.status ? (
                        <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {selectedAsset.status}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="shrink-0 border-b">
                      <button
                        type="button"
                        onClick={() => setDetailsExpanded((current) => !current)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <span className="text-sm font-semibold">File Info & Review</span>
                        {detailsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {detailsExpanded ? (
                        <div className="max-h-[34vh] overflow-y-auto border-t bg-gray-50/60 px-4 py-4 dark:bg-gray-950/60">
                          <div className="space-y-4">
                            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                              <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                                Your Review
                              </h4>
                              <div className="flex flex-wrap items-center gap-2">
                                {[
                                  { key: 'positive' as const, emoji: '👍', label: 'Positive' },
                                  { key: 'neutral' as const, emoji: '😐', label: 'Neutral' },
                                  { key: 'negative' as const, emoji: '👎', label: 'Needs work' },
                                ].map((option) => (
                                  <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => handleAssetRating(option.key)}
                                    className={cn(
                                      'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                                      currentVisitorRating === option.key
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-200'
                                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900'
                                    )}
                                  >
                                    <span className="text-base">{option.emoji}</span>
                                    <span>{option.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                              <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                                File Info
                              </h4>
                              <div className="grid gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center justify-between gap-3">
                                  <span>Cloud</span>
                                  <span>{selectedAsset.source ? <CloudPill source={selectedAsset.source} /> : '-'}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span>Synced</span>
                                  <span className="text-right">{selectedAsset.syncedAt ?? '-'}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                  <span>Version</span>
                                  <span className="text-right">{selectedAsset.version ?? '-'}</span>
                                </div>
                              </div>
                              {selectedAsset.sourcePath ? (
                                <p className="mt-3 break-words rounded-lg bg-gray-50 px-2.5 py-2 text-[11px] text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                                  {selectedAsset.sourcePath}
                                </p>
                              ) : null}
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                                  All Ratings
                                </h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{totalRatings} total</span>
                              </div>
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

                            {selectedAsset.activity?.[0] ? (
                              <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  <span>{selectedAsset.activity[0].author}</span>
                                </div>
                                <p className="mt-2">{selectedAsset.activity[0].detail}</p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCommentsExpanded((current) => !current)}
                        className="flex w-full items-center justify-between border-b px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <span className="text-sm font-semibold">Comments ({totalCommentCount})</span>
                        {commentsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>

                      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
                        <div className="min-h-0 overflow-y-auto">
                          {commentsExpanded ? (
                            <div className="space-y-4 p-4">
                              {currentComments.length > 0 ? (
                                currentComments.map((comment) => renderComment(comment))
                              ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  No comments yet. Add one to start the thread.
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex min-h-full items-end p-4">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Expand comments to read the thread. You can still add a new comment below.
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 space-y-3 border-t bg-white p-4 dark:bg-gray-950">
                          <div className="flex items-center gap-1">
                            {['😊', '😐', '😞', '👍', '🔥'].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => addEmojiToComposer(emoji)}
                                className="rounded-full px-2 py-1 text-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-start gap-2">
                            <Textarea
                              placeholder="Type your comment..."
                              value={newComment}
                              onChange={(event) => setNewComment(event.target.value)}
                              className="min-h-[96px] resize-none bg-gray-100 dark:bg-gray-800"
                            />
                            <Button type="button" onClick={handleCommentSubmit} disabled={isSendingComment} size="icon">
                              {isSendingComment ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              ) : (
                                <SendHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
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
