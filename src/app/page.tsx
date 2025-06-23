"use client";

import { useState, useEffect, useCallback, useRef, MouseEvent, KeyboardEvent, FormEvent, useMemo } from 'react';
import { 
  LogOut, Folder, File, ChevronRight, ChevronDown, LoaderCircle, MessageSquare, 
  Image as ImageIcon, FileQuestion, 
  SendHorizontal, Pencil, Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();


// Type Definitions
type User = {
  id: number;
  username: string;
};

type Asset = {
  '.tag': 'file' | 'folder';
  id: string;
  name: string;
  path_lower: string;
  path_display: string;
  namespaceId: string;
  is_downloadable?: boolean;
  children?: Asset[];
  isOpen?: boolean;
  isLoading?: boolean;
};

type Reaction = {
  id: number;
  emoji: string;
  userId: number;
  user: {
    id: number;
    username: string;
  }
}

type Comment = {
  id: number;
  content: string;
  assetId: string;
  createdAt: string;
  user: User;
  reactions: Reaction[];
};

type Annotation = {
  rating: number;
  assetId: string;
  userId: number;
  user: User;
};

type ContextMenuInfo = {
  x: number;
  y: number;
  comment: Comment;
};

type Filters = {
  name: string;
  type: 'all' | 'image' | 'video' | 'pdf';
  hasNegativeRating: boolean;
  hasComments: boolean;
};


// --- EMOJI / REACTION MAPPING ---
// Using string emojis directly so they render natively on each OS
const reactionEmojis = ['👍', '👎', '❤️', '😂'];


// Helper Components
const AssetTreeItem = ({ node, selectedAsset, onSelectAsset, onToggleFolder }: {
  node: Asset;
  selectedAsset: Asset | null;
  onSelectAsset: (asset: Asset) => void;
  onToggleFolder: (asset: Asset) => void;
}) => {
  const isFolder = node['.tag'] === 'folder';

  const handleItemClick = () => {
    onSelectAsset(node);
    if (isFolder) {
      onToggleFolder(node);
    }
  };

  return (
    <div>
      <div 
        className={`flex items-center p-1 my-0.5 rounded-md cursor-pointer transition-colors ${selectedAsset?.id === node.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        onClick={handleItemClick}
      >
        <div className="w-6 text-gray-500 flex items-center justify-center">
          {isFolder && (
            node.isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> :
            node.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          )}
        </div>
        {isFolder ? <Folder className="w-5 h-5 mr-2 text-blue-500" /> : <File className="w-5 h-5 mr-2 text-gray-400" />}
        <span className="truncate text-sm">{node.name}</span>
      </div>
      {node.isOpen && node.children && (
        <div className="pl-5 border-l border-gray-200 dark:border-gray-700 ml-3">
          {node.children.map(child => (
            <AssetTreeItem 
              key={child.id}
              node={child} 
              selectedAsset={selectedAsset}
              onSelectAsset={onSelectAsset}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [tree, setTree] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetPreview, setAssetPreview] = useState<string | null>(null);
  const [assetPreviewError, setAssetPreviewError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [allRatings, setAllRatings] = useState<Annotation[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuInfo | null>(null);
  const [filteredList, setFilteredList] = useState<Asset[] | null>(null);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    name: '',
    type: 'all',
    hasNegativeRating: false,
    hasComments: false,
  });

  const isFilteredView = useMemo(() => filters.hasNegativeRating || filters.hasComments, [filters]);

  useEffect(() => {
    const performFilterQuery = async () => {
      if (isFilteredView) {
        setIsLoadingFilter(true);
        try {
          const response = await fetch('/api/assets/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hasNegativeRating: filters.hasNegativeRating,
              hasComments: filters.hasComments,
            }),
          });
          if (!response.ok) throw new Error('Failed to fetch filtered assets');
          const data = await response.json();
          setFilteredList(data);
        } catch (error) {
          console.error(error);
          toast.error("Could not load filtered list.");
          setFilteredList([]);
        } finally {
          setIsLoadingFilter(false);
        }
      } else {
        setFilteredList(null);
      }
    };

    const timeoutId = setTimeout(performFilterQuery, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [isFilteredView, filters.hasNegativeRating, filters.hasComments]);

  const fetchAssetMetadata = useCallback(async (nodes: Asset[]) => {
    const assetIds: string[] = [];
    const collectIds = (nodes: Asset[]) => {
        nodes.forEach(node => {
            if (node['.tag'] === 'file') {
                assetIds.push(node.id);
            }
            if (node.children) {
                collectIds(node.children);
            }
        });
    };
    collectIds(nodes);

    if (assetIds.length > 0) {
        try {
            const response = await fetch('/api/assets/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetIds }),
            });
            if (!response.ok) throw new Error('Failed to fetch metadata');
        } catch (error) {
            console.error(error);
            toast.error("Could not load asset metadata for filtering.");
        }
    }
  }, []);

  const finalFilteredList = useMemo(() => {
    if (!filteredList) return null;
    return filteredList.filter(_asset => _asset.name.toLowerCase().includes(filters.name.toLowerCase()));
  }, [filteredList, filters.name, filters]);

  const filteredTree = useMemo(() => {
    const filterNodes = (nodes: Asset[]): Asset[] => {
      const { name, type } = filters;

      if (!name && type === 'all') {
        return nodes;
      }

      const checkType = (_asset: Asset) => {
        if (filters.type === 'all') return true;
        const extension = _asset.name.split('.').pop()?.toLowerCase();
        if (!extension) return false;

        if (filters.type === 'image') return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
        if (filters.type === 'video') return ['mp4', 'mov', 'avi', 'webm'].includes(extension);
        if (filters.type === 'pdf') return extension === 'pdf';
        return false;
      };

      return nodes.map(node => {
        const children = node.children ? filterNodes(node.children) : undefined;
        
        const nameMatch = node.name.toLowerCase().includes(filters.name.toLowerCase());
        
        if (node['.tag'] === 'folder') {
            if (children && children.length > 0) {
                return { ...node, children, isOpen: true }; // Keep folder if children match
            }
            // Also keep folder if it matches the name search directly
            return nameMatch ? { ...node, children } : null;
        }

        // It's a file, check for match
        const typeMatch = checkType(node);
        if (nameMatch && typeMatch) {
          return node;
        }

        return null;
      }).filter((node): node is Asset => node !== null);
    };

    return filterNodes(tree);
  }, [tree, filters.name, filters.type]);

  const router = useRouter();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [comments]);

  // --- DATA FETCHING ---
  const fetchTree = useCallback(async (path = '', namespaceId = '') => {
    if (!path) setIsLoadingTree(true);
    try {
      const response = await fetch(`/api/assets?path=${encodeURIComponent(path)}&namespace_id=${namespaceId}`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      const data: Asset[] = await response.json();
      
      const updateTreeState = (nodes: Asset[], targetPath: string, children: Asset[]): Asset[] => {
        return nodes.map(node => {
          if (node.path_lower === targetPath) {
            return { ...node, children, isOpen: true, isLoading: false };
          }
          if (node.children) {
            return { ...node, children: updateTreeState(node.children, targetPath, children) };
          }
          return node;
        });
      };
      
      if (path) {
        setTree(prevTree => updateTreeState(prevTree, path, data));
      } else {
        setTree(data);
        fetchAssetMetadata(data); // Fetch metadata on initial load
      }
      return data; // Return data for chaining
    } catch (error) {
      console.error(error);
      toast.error("Could not load file tree.");
    } finally {
      if (!path) setIsLoadingTree(false);
    }
  }, [fetchAssetMetadata]);

  const fetchComments = useCallback(async (assetId: string) => {
    try {
      const response = await fetch(`/api/comments?assetId=${assetId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load comments.");
    }
  }, []);

  const fetchAssetRatings = useCallback(async (assetId: string) => {
    try {
      const response = await fetch(`/api/annotations?assetId=${assetId}`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      setAllRatings(data);
    } catch (error) {
      console.error(error);
    }
  }, []);
  
  const fetchAllAnnotations = useCallback(async (userId: number) => {
    try {
      const response = await fetch(`/api/annotations/all?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch all annotations');
      const data = await response.json();
      setAnnotations(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchPreview = useCallback(async (asset: Asset) => {
    setIsLoadingPreview(true);
    setAssetPreview(null);
    setAssetPreviewError(null);
    try {
      const response = await fetch('/api/assets/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: asset.path_lower, namespaceId: asset.namespaceId }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get preview link');
      }
      const data = await response.json();
      setAssetPreview(data.link);
    } catch (error: unknown) {
      setAssetPreviewError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      fetchTree().then(initialTree => {
        if(initialTree) fetchAssetMetadata(initialTree);
      });
      fetchAllAnnotations(parsedUser.id);
    } else {
      router.push('/login');
    }
  }, [router, fetchTree, fetchAssetMetadata, fetchAllAnnotations]);

  useEffect(() => {
    if (selectedAsset) {
      fetchComments(selectedAsset.id);
      fetchAssetRatings(selectedAsset.id);
      if (selectedAsset['.tag'] === 'file') {
        fetchPreview(selectedAsset);
      } else {
        setAssetPreview(null);
        setAssetPreviewError(null);
      }
    }
  }, [selectedAsset, fetchComments, fetchAssetRatings, fetchPreview]);


  // --- HANDLERS ---
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const handleToggleFolder = useCallback(async (nodeToToggle: Asset) => {
    const updateNodeState = (nodes: Asset[], path: string, updates: Partial<Asset>): Asset[] => {
        return nodes.map(node => {
            if (node.path_lower === path) return { ...node, ...updates };
            if (node.children) return { ...node, children: updateNodeState(node.children, path, updates) };
            return node;
        });
    };

    if (!nodeToToggle.isOpen) {
      setTree(prevTree => updateNodeState(prevTree, nodeToToggle.path_lower, { isLoading: true }));
      await fetchTree(nodeToToggle.path_lower, nodeToToggle.namespaceId);
    } else {
      setTree(prevTree => updateNodeState(prevTree, nodeToToggle.path_lower, { isOpen: false }));
    }
  }, [fetchTree]);
  
  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };
  
  const handleRateAsset = async (rating: number) => {
    if (!selectedAsset || !user) return;
    const originalAnnotations = [...annotations];
    const newAnnotation = { assetId: selectedAsset.id, rating, userId: user.id, user };
    setAnnotations(prev => {
      const existingIndex = prev.findIndex(a => a.assetId === selectedAsset!.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = newAnnotation;
        return updated;
      }
      return [...prev, newAnnotation];
    });

    try {
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: selectedAsset.id, userId: user.id, rating }),
      });
      if (!response.ok) throw new Error('Failed to save rating');
      const savedAnnotation = await response.json();
      setAnnotations(prev => prev.map(a => a.assetId === savedAnnotation.assetId ? savedAnnotation : a));
      fetchAssetRatings(selectedAsset.id);
    } catch (error) {
      console.error(error);
      setAnnotations(originalAnnotations);
      toast.error("Could not save your rating.");
    }
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && selectedAsset && user) {
      setIsSendingComment(true);
      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId: selectedAsset.id, userId: user.id, content: newComment }),
        });
        if (!response.ok) throw new Error('Failed to post comment');
        const createdComment = await response.json();
        setComments(prev => [...prev, createdComment]);
        setNewComment('');
      } catch (error) {
        console.error(error);
        toast.error("Could not post your comment.");
      } finally {
        setIsSendingComment(false);
      }
    }
  };
  
  const handleCommentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit(e as unknown as FormEvent);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (editingContent.trim() && user) {
      const originalComments = [...comments];
      const updatedComment = comments.find(c => c.id === commentId);
      if(!updatedComment) return;

      setComments(prev => prev.map(c => (c.id === commentId ? { ...c, content: editingContent } : c)));
      setEditingCommentId(null);
      
      try {
        const response = await fetch(`/api/comments`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commentId, content: editingContent, userId: user.id }),
        });
        if (!response.ok) throw new Error( (await response.json()).message || 'Failed to update comment');
        fetchComments(updatedComment.assetId); // re-fetch to be safe
      } catch (error) {
        console.error(error);
        setComments(originalComments);
        toast.error("Could not update comment.");
      } finally {
        setEditingContent('');
      }
    }
  };

  const handleRightClick = (e: MouseEvent, comment: Comment) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.pageX, y: e.pageY, comment });
  };
  
  const handleCloseContextMenu = useCallback(() => setContextMenu(null), []);
  
  useEffect(() => {
    if (contextMenu) {
      document.addEventListener('click', handleCloseContextMenu);
      return () => document.removeEventListener('click', handleCloseContextMenu);
    }
  }, [contextMenu, handleCloseContextMenu]);

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;
    const originalComments = [...comments];
    setComments(prev => prev.filter(c => c.id !== commentId));
    try {
      const response = await fetch(`/api/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userId: user.id }),
      });
  
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to delete comment');
      toast.success("Comment deleted.");
    } catch (error) {
      console.error(error);
      setComments(originalComments);
      toast.error("Could not delete comment.");
    }
  };
  
  const handleReaction = async (commentId: number, emoji: string) => {
    if (!user) return;
    const originalComments = [...comments];
    
    // Optimistic update
    setComments(prevComments =>
      prevComments.map(c => {
        if (c.id === commentId) {
          const existingReaction = c.reactions.find(r => r.userId === user.id);
          const newReactions = existingReaction 
            ? c.reactions.filter(r => r.userId !== user.id)
            : [...c.reactions, { id: Date.now(), emoji, userId: user.id, user }];
          
          if(existingReaction && existingReaction.emoji !== emoji){
             newReactions.push({ id: Date.now(), emoji, userId: user.id, user });
          }

          return { ...c, reactions: newReactions };
        }
        return c;
      })
    );
  
    try {
      const response = await fetch(`/api/comments/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userId: user.id, emoji }),
      });
      if (!response.ok) throw new Error('Failed to toggle reaction');
      const updatedComment = await response.json();
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
    } catch (error) {
      console.error('Failed to toggle reaction', error);
      setComments(originalComments);
      toast.error("Could not save reaction.");
    }
  };

  // --- RENDER LOGIC ---
  const userRating = annotations.find(a => a.assetId === selectedAsset?.id)?.rating;
  
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-black">
        <LoaderCircle className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <main className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-black text-black dark:text-white">
        <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-950 px-6 shrink-0">
          <h1 className="text-lg font-semibold">Asset Rating</h1>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Welcome, {user.username}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </header>

        <div className="flex items-center gap-4 p-3 border-b bg-white dark:bg-gray-950 shrink-0">
          <Input 
            placeholder="Filter by name..." 
            className="max-w-xs"
            value={filters.name}
            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
          />
          <div className="flex items-center gap-2">
            <Label htmlFor="type-filter">File Type</Label>
            <Select value={filters.type} onValueChange={(v) => setFilters(p => ({...p, type: v as Filters['type']}))}>
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
          <div className="flex items-center space-x-2 ml-auto">
            <Switch id="negative-rating-filter" checked={filters.hasNegativeRating} onCheckedChange={(c) => setFilters(p => ({...p, hasNegativeRating: c}))} />
            <Label htmlFor="negative-rating-filter">Has Negative Rating</Label>
          </div>
           <div className="flex items-center space-x-2">
            <Switch id="comments-filter" checked={filters.hasComments} onCheckedChange={(c) => setFilters(p => ({...p, hasComments: c}))} />
            <Label htmlFor="comments-filter">Has Comments</Label>
          </div>
        </div>

        <ResizablePanelGroup direction="horizontal" className="flex-grow">
          {/* File Tree Panel */}
          <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
            <div className="flex flex-col h-full">
              <h2 className="text-lg font-semibold p-4 border-b">
                Assets
              </h2>
              <ScrollArea className="flex-grow p-2">
               {isFilteredView ? (
                 isLoadingFilter ? (
                   <div className="flex items-center justify-center p-4">
                     <LoaderCircle className="w-6 h-6 animate-spin" />
                     <span className="ml-2">Loading...</span>
                   </div>
                 ) : (
                   finalFilteredList && finalFilteredList.length > 0 ? (
                     finalFilteredList.map(asset => (
                       <div 
                         key={asset.id}
                         className={`flex items-center p-1 my-0.5 rounded-md cursor-pointer transition-colors ${selectedAsset?.id === asset.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                         onClick={() => handleSelectAsset(asset)}
                       >
                         <File className="w-5 h-5 mr-2 text-gray-400" />
                         <span className="truncate text-sm">{asset.name}</span>
                       </div>
                     ))
                   ) : (
                     <div className="text-center text-gray-500 p-4">No assets match the current filters.</div>
                   )
                 )
               ) : (
                 isLoadingTree ? (
                   <div className="flex items-center justify-center p-4">
                     <LoaderCircle className="w-6 h-6 animate-spin" />
                     <span className="ml-2">Loading Assets...</span>
                   </div>
                 ) : (
                   filteredTree.map(node => (
                     <AssetTreeItem
                       key={node.id}
                       node={node}
                       selectedAsset={selectedAsset}
                       onSelectAsset={handleSelectAsset}
                       onToggleFolder={handleToggleFolder}
                     />
                   ))
                 )
               )}
              </ScrollArea>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          
          {/* Asset Preview Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-900">
              {!selectedAsset && (<div className="text-gray-500"><ImageIcon size={48} className="opacity-50"/></div>)}
              {selectedAsset?.['.tag'] === 'folder' && (<div className="text-gray-500"><Folder size={48} className="opacity-50"/></div>)}
              {isLoadingPreview && <LoaderCircle className="w-10 h-10 animate-spin text-blue-500" />}
              {assetPreviewError && (
                  <div className="text-red-500 text-center p-4">
                    <FileQuestion size={48} className="mx-auto opacity-50 mb-2"/>
                    <p>{assetPreviewError}</p>
                  </div>
              )}
              {assetPreview && (
                (() => {
                  const fileType = selectedAsset?.name.split('.').pop()?.toLowerCase();
                  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType || '');
                  const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(fileType || '');
                  const isPdf = fileType === 'pdf';
                  
                  if (isImage) return <Image src={assetPreview} alt={selectedAsset!.name} className="max-w-full max-h-full object-contain" width={600} height={800} />;
                  if (isVideo) return <video src={assetPreview} controls className="max-w-full max-h-full"/>;
                  if (isPdf) {
                    return (
                       <div className="w-full h-full bg-white dark:bg-black overflow-y-auto">
                        <Document file={assetPreview} loading={<LoaderCircle className="w-8 h-8 animate-spin text-blue-500" />} >
                          <Page pageNumber={1} width={600} />
                        </Document>
                      </div>
                    )
                  }
                  
                  return (
                    <div className="text-gray-500 text-center">
                      <File size={48} className="mx-auto opacity-50 mb-2"/>
                      <p>No preview available.</p>
                      <a href={assetPreview} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Download</a>
                    </div>
                  );
                })()
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />

          {/* Details & Comments Panel */}
          <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
            <div className="flex flex-col h-full">
              {!selectedAsset ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="w-16 h-16 opacity-30" />
                  <p className="mt-4">Select an asset to see details</p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b shrink-0">
                      <h3 className="font-semibold text-lg truncate" title={selectedAsset.name}>{selectedAsset.name}</h3>
                  </div>
                  <div className="p-4 space-y-4 border-b shrink-0">
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Your Rating</h4>
                      <div className="flex items-center gap-3">
                        {[
                          { rating: 1, emoji: '😊', color: "green" },
                          { rating: 0, emoji: '😐', color: "yellow" },
                          { rating: -1, emoji: '😞', color: "red" }
                        ].map(({rating, emoji, color}) => (
                           <button 
                             key={rating} 
                             onClick={() => handleRateAsset(rating)} 
                             className={`rounded-full h-12 w-12 transition-all flex items-center justify-center
                               ${userRating === rating 
                                 ? `ring-2 ring-offset-2 dark:ring-offset-black ring-${color}-500` 
                                 : `hover:bg-gray-100 dark:hover:bg-gray-800`
                               }`
                             }
                           >
                             <span className={`text-3xl transition-transform ${userRating === rating ? 'scale-110' : 'scale-90 opacity-60'}`}>{emoji}</span>
                           </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-sm">All Ratings ({allRatings.length})</h4>
                      {allRatings.length > 0 ? (
                        <div className="flex -space-x-2">
                          {allRatings.map(({user, rating}) => (
                             <TooltipProvider key={user.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-black font-semibold text-xs">
                                    {user.username.charAt(0).toUpperCase()}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent><p>{user.username} rated it {rating === 1 ? 'Positive' : rating === 0 ? 'Neutral' : 'Negative'}</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-500">No ratings yet.</p>}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col min-h-0">
                      <h3 className="p-4 font-semibold border-b shrink-0">Comments ({comments.length})</h3>
                      <ScrollArea className="flex-1">
                         <div className="p-4 space-y-4">
                          {comments.map((comment) => (
                            <div key={comment.id} onContextMenu={e => handleRightClick(e, comment)} className="group flex items-start gap-3 w-full">
                             <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold shrink-0 text-xs">
                                {comment.user.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">{comment.user.username}</span>
                                  <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  {user && comment.user.id === user.id && (
                                    <Button size="icon" variant="ghost" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => { setEditingCommentId(comment.id); setEditingContent(comment.content); }}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                                 {editingCommentId === comment.id ? (
                                    <div className="space-y-2 mt-1">
                                      <Textarea value={editingContent} onChange={e => setEditingContent(e.target.value)} className="min-h-[60px]"/>
                                      <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                                        <Button size="sm" onClick={() => handleUpdateComment(comment.id)}>Save</Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-sm mt-1 prose prose-sm dark:prose-invert max-w-none break-words">
                                      {comment.content}
                                    </div>
                                  )}
                                  {comment.reactions?.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-2">
                                      {Object.entries(comment.reactions.reduce((acc, r) => {
                                        acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc;
                                      }, {} as Record<string, number>)).map(([emoji, count]) => (
                                        <TooltipProvider key={emoji}><Tooltip>
                                          <TooltipTrigger asChild>
                                             <button onClick={() => handleReaction(comment.id, emoji)} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-xs">
                                              <span className="text-sm">{emoji}</span>
                                              <span className="font-semibold">{count}</span>
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent><p>{comment.reactions.filter(r => r.emoji === emoji).map(r => r.user.username).join(', ')}</p></TooltipContent>
                                        </Tooltip></TooltipProvider>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            </div>
                          ))}
                           <div ref={commentsEndRef} />
                        </div>
                      </ScrollArea>
                      <div className="p-4 border-t bg-white dark:bg-gray-950 shrink-0">
                          <form onSubmit={handleCommentSubmit} className="flex items-start gap-2">
                              <Textarea placeholder="Type your comment..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={handleCommentKeyDown} className="flex-1 resize-none bg-gray-100 dark:bg-gray-800" rows={1} />
                              <Button type="submit" disabled={isSendingComment} size="icon">
                                 {isSendingComment ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                              </Button>
                          </form>
                      </div>
                  </div>
                </>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-white dark:bg-gray-800 border rounded-md shadow-lg p-1 animate-in fade-in-90"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-1 mb-1 border-b pb-1 px-1">
            {reactionEmojis.map(emoji => (
              <Button key={emoji} variant="ghost" size="icon" className="h-8 w-8 text-xl" onClick={() => handleReaction(contextMenu.comment.id, emoji)}>
                {emoji}
              </Button>
            ))}
          </div>
          {user && contextMenu.comment.user.id === user.id && (
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
              onClick={() => handleDeleteComment(contextMenu.comment.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          )}
        </div>
      )}
    </>
  );
}
