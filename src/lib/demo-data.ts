export type DemoCloud = 'Dropbox' | 'Google Drive' | 'OneDrive' | 'iCloud Drive';

export type DemoReaction = {
  emoji: string;
  users: string[];
};

export type DemoComment = {
  id: number;
  author: string;
  content: string;
  time: string;
  anchor?: string;
  markerPercent?: number;
  reactions?: DemoReaction[];
};

export type DemoReview = {
  positive: number;
  neutral: number;
  negative: number;
};

export type DemoActivity = {
  id: number;
  author: string;
  action: string;
  detail: string;
  time: string;
};

export type DemoCloudConnection = {
  id: string;
  name: DemoCloud;
  account: string;
  status: 'Connected' | 'Syncing';
  syncedToday: number;
};

export type DemoAsset = {
  id: string;
  name: string;
  type: 'folder' | 'image' | 'video' | 'pdf';
  description: string;
  preview?: string;
  status?: 'Approved' | 'Needs Work' | 'In Review';
  source?: DemoCloud;
  sourcePath?: string;
  syncedAt?: string;
  syncedBy?: string;
  version?: string;
  campaign?: string;
  owner?: string;
  reviews?: DemoReview;
  comments?: DemoComment[];
  activity?: DemoActivity[];
  children?: DemoAsset[];
};

export const demoCloudConnections: DemoCloudConnection[] = [
  {
    id: 'dropbox',
    name: 'Dropbox',
    account: 'Concept Manufacturing / Creative',
    status: 'Connected',
    syncedToday: 8,
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    account: 'Concept Manufacturing / GTM',
    status: 'Connected',
    syncedToday: 6,
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    account: 'Concept Manufacturing / Retail Ops',
    status: 'Syncing',
    syncedToday: 5,
  },
  {
    id: 'icloud-drive',
    name: 'iCloud Drive',
    account: 'Concept Manufacturing / Leadership',
    status: 'Connected',
    syncedToday: 3,
  },
];

export const demoTree: DemoAsset[] = [
  {
    id: 'dropbox-creative',
    name: '1 - Dropbox / Creative',
    type: 'folder',
    source: 'Dropbox',
    description: 'Motion, packaging, and creative explorations synced from Dropbox.',
    children: [
      {
        id: 'dropbox-spring-launch',
        name: 'Spring Launch 2026',
        type: 'folder',
        description: 'Dropbox project root for creative production assets.',
        children: [
          {
            id: 'dropbox-video-folder',
            name: 'Video',
            type: 'folder',
            description: 'Launch teaser cuts and exports.',
            children: [
              {
                id: 'launch-teaser-v4',
                name: 'Launch teaser v4.mp4',
                type: 'video',
                description: 'Hero launch reel used to explain how assets flow in from Dropbox, Google Drive, and OneDrive.',
                preview: '/demo/social-motion.svg',
                status: 'Needs Work',
                source: 'Dropbox',
                sourcePath: '/Creative/Spring Launch 2026/Video/Launch teaser v4.mp4',
                syncedAt: '2 min ago',
                syncedBy: 'Dropbox connector',
                version: 'v4',
                campaign: 'Spring Launch 2026',
                owner: 'Creative Studio',
                reviews: { positive: 1, neutral: 1, negative: 2 },
                comments: [
                  {
                    id: 1,
                    author: 'Nadia',
                    time: '09:12',
                    anchor: '00:03',
                    markerPercent: 8,
                    content: 'Open with motion immediately. The first beat looks frozen.',
                    reactions: [{ emoji: '👍', users: ['Eric'] }],
                  },
                  {
                    id: 2,
                    author: 'Eric',
                    time: '09:24',
                    anchor: '00:12',
                    markerPercent: 28,
                    content: 'The multi-cloud story is working. Hold the Google Drive card on screen a little longer.',
                    reactions: [{ emoji: '❤️', users: ['Nadia', 'Manouk'] }],
                  },
                  {
                    id: 3,
                    author: 'Manouk',
                    time: '09:40',
                    anchor: '00:34',
                    markerPercent: 61,
                    content: 'CTA is too small at the end. Increase scale before export.',
                    reactions: [{ emoji: '👀', users: ['Chuck'] }],
                  },
                ],
                activity: [
                  {
                    id: 1,
                    author: 'Dropbox connector',
                    action: 'Synced new version',
                    detail: 'Imported v4 from the shared launch folder.',
                    time: '08:58',
                  },
                  {
                    id: 2,
                    author: 'Nadia',
                    action: 'Added timecoded feedback',
                    detail: 'Flagged the first motion beat at 00:03.',
                    time: '09:12',
                  },
                  {
                    id: 3,
                    author: 'Eric',
                    action: 'Requested edit',
                    detail: 'Asked for a longer Google Drive source callout.',
                    time: '09:24',
                  },
                ],
              },
            ],
          },
          {
            id: 'dropbox-packaging-folder',
            name: 'Packaging',
            type: 'folder',
            description: 'Packaging boards and design exports.',
            children: [
              {
                id: 'packaging-board-v3',
                name: 'Packaging concept board v3.png',
                type: 'image',
                description: 'Shelf packaging pulled in from Dropbox so the team can review it beside launch docs from the other clouds.',
                preview: '/demo/packaging-concepts.svg',
                status: 'In Review',
                source: 'Dropbox',
                sourcePath: '/Creative/Spring Launch 2026/Packaging/Packaging concept board v3.png',
                syncedAt: '18 min ago',
                syncedBy: 'Dropbox connector',
                version: 'v3',
                campaign: 'Spring Launch 2026',
                owner: 'Packaging Team',
                reviews: { positive: 2, neutral: 1, negative: 0 },
                comments: [
                  {
                    id: 4,
                    author: 'Eric',
                    time: '10:05',
                    content: 'Direction is strong. Keep this board linked to the retail spec sheet for final approval.',
                    reactions: [{ emoji: '👍', users: ['Lena', 'Manouk'] }],
                  },
                  {
                    id: 5,
                    author: 'Lena',
                    time: '10:14',
                    content: 'Approve after the logo lockup is aligned with the spec sheet dimensions.',
                    reactions: [{ emoji: '✅', users: ['Eric'] }],
                  },
                ],
                activity: [
                  {
                    id: 4,
                    author: 'Dropbox connector',
                    action: 'Indexed asset',
                    detail: 'Made available in the shared review queue.',
                    time: '09:57',
                  },
                  {
                    id: 5,
                    author: 'Eric',
                    action: 'Left review note',
                    detail: 'Linked packaging to the OneDrive retail spec.',
                    time: '10:05',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'google-drive-planning',
    name: '2 - Google Drive / Planning',
    type: 'folder',
    source: 'Google Drive',
    description: 'Go-to-market plans and campaign boards synced from Google Drive.',
    children: [
      {
        id: 'google-drive-spring-launch',
        name: 'Spring Launch 2026',
        type: 'folder',
        description: 'Google Drive campaign planning documents.',
        children: [
          {
            id: 'google-drive-board-folder',
            name: 'Boards',
            type: 'folder',
            description: 'Campaign planning boards and visual overviews.',
            children: [
              {
                id: 'retail-launch-board',
                name: 'Retail launch board.png',
                type: 'image',
                description: 'Google Drive campaign board that ties the video, packaging, and partner docs into one launch narrative.',
                preview: '/demo/launch-board.svg',
                status: 'In Review',
                source: 'Google Drive',
                sourcePath: '/Go To Market/Spring Launch 2026/Boards/Retail launch board.png',
                syncedAt: '9 min ago',
                syncedBy: 'Google Drive connector',
                version: 'v6',
                campaign: 'Spring Launch 2026',
                owner: 'Growth Team',
                reviews: { positive: 2, neutral: 1, negative: 0 },
                comments: [
                  {
                    id: 6,
                    author: 'Chuck',
                    time: '11:02',
                    content: 'This is the clearest overview of the cross-cloud workflow. Keep it pinned in the demo.',
                    reactions: [{ emoji: '🔥', users: ['Manouk'] }],
                  },
                  {
                    id: 7,
                    author: 'Manouk',
                    time: '11:17',
                    content: 'Use this as the default image when explaining unified review to prospects.',
                    reactions: [{ emoji: '👍', users: ['Chuck', 'Nadia'] }],
                  },
                ],
                activity: [
                  {
                    id: 6,
                    author: 'Google Drive connector',
                    action: 'Synced latest board',
                    detail: 'Pulled v6 after a GTM update.',
                    time: '10:54',
                  },
                  {
                    id: 7,
                    author: 'Chuck',
                    action: 'Marked for demo',
                    detail: 'Recommended this board as the best overview asset.',
                    time: '11:02',
                  },
                ],
              },
            ],
          },
          {
            id: 'google-drive-docs-folder',
            name: 'Docs',
            type: 'folder',
            description: 'Briefing docs and onboarding PDFs.',
            children: [
              {
                id: 'campaign-one-pager',
                name: 'Campaign onboarding one-pager.pdf',
                type: 'pdf',
                description: 'Google Drive briefing document that explains how launch files are gathered into one review workspace.',
                preview: '/demo/customer-one-pager.svg',
                status: 'Approved',
                source: 'Google Drive',
                sourcePath: '/Go To Market/Spring Launch 2026/Docs/Campaign onboarding one-pager.pdf',
                syncedAt: '42 min ago',
                syncedBy: 'Google Drive connector',
                version: 'final',
                campaign: 'Spring Launch 2026',
                owner: 'Revenue Operations',
                reviews: { positive: 3, neutral: 0, negative: 0 },
                comments: [
                  {
                    id: 8,
                    author: 'Nadia',
                    time: '11:36',
                    content: 'Approved. This explains the unified review queue without needing a separate pitch slide.',
                    reactions: [{ emoji: '✅', users: ['Chuck', 'Manouk'] }],
                  },
                ],
                activity: [
                  {
                    id: 8,
                    author: 'Google Drive connector',
                    action: 'Imported PDF',
                    detail: 'Added the final one-pager to the demo workspace.',
                    time: '11:10',
                  },
                  {
                    id: 9,
                    author: 'Nadia',
                    action: 'Approved asset',
                    detail: 'Confirmed this can be shown externally.',
                    time: '11:36',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'onedrive-ops',
    name: '3 - OneDrive / Retail Ops',
    type: 'folder',
    source: 'OneDrive',
    description: 'Retail specs and operations docs synced from OneDrive.',
    children: [
      {
        id: 'onedrive-retail-folder',
        name: 'Retail Specs',
        type: 'folder',
        description: 'OneDrive operational specs and store-facing docs.',
        children: [
          {
            id: 'retail-spec-sheet',
            name: 'Retail spec sheet.pdf',
            type: 'pdf',
            description: 'Final retail spec synced from OneDrive and reviewed in the same queue as creative and GTM assets.',
            preview: '/demo/spec-sheet.svg',
            status: 'Approved',
            source: 'OneDrive',
            sourcePath: '/Retail Ops/Spring Launch 2026/Retail Specs/Retail spec sheet.pdf',
            syncedAt: '6 min ago',
            syncedBy: 'OneDrive connector',
            version: 'approved',
            campaign: 'Spring Launch 2026',
            owner: 'Retail Operations',
            reviews: { positive: 4, neutral: 0, negative: 0 },
            comments: [
              {
                id: 9,
                author: 'Chuck',
                time: '12:04',
                content: 'Approved. This is the proof point that OneDrive docs stay in the same review stream as the Dropbox creative.',
                reactions: [{ emoji: '👍', users: ['Eric', 'Nadia'] }],
              },
            ],
            activity: [
              {
                id: 10,
                author: 'OneDrive connector',
                action: 'Synced approved file',
                detail: 'Imported the final retail PDF from the ops share.',
                time: '11:59',
              },
              {
                id: 11,
                author: 'Chuck',
                action: 'Approved asset',
                detail: 'Cleared for external partner sharing.',
                time: '12:04',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'icloud-executive',
    name: '4 - iCloud Drive / Executive Review',
    type: 'folder',
    source: 'iCloud Drive',
    description: 'Executive summary files synced from iCloud Drive.',
    children: [
      {
        id: 'icloud-board-folder',
        name: 'Board Review',
        type: 'folder',
        description: 'Executive review notes exported from iCloud Drive.',
        children: [
          {
            id: 'board-review-notes',
            name: 'Board review notes.pages',
            type: 'pdf',
            description: 'Leadership notes exported from iCloud Drive for final launch sign-off.',
            preview: '/demo/customer-one-pager.svg',
            status: 'In Review',
            source: 'iCloud Drive',
            sourcePath: '/Executive/Board Review/Board review notes.pages',
            syncedAt: '11 min ago',
            syncedBy: 'iCloud Drive connector',
            version: 'rev-b',
            campaign: 'Spring Launch 2026',
            owner: 'Leadership',
            reviews: { positive: 1, neutral: 1, negative: 0 },
            comments: [
              {
                id: 10,
                author: 'Manouk',
                time: '12:18',
                content: 'Keep this in the same queue so leadership feedback sits beside creative and retail docs.',
                reactions: [{ emoji: '👍', users: ['Chuck'] }],
              },
            ],
            activity: [
              {
                id: 12,
                author: 'iCloud Drive connector',
                action: 'Synced board notes',
                detail: 'Imported the latest Pages export from the leadership share.',
                time: '12:10',
              },
            ],
          },
        ],
      },
    ],
  },
];

export function flattenDemoAssets(nodes: DemoAsset[]): DemoAsset[] {
  return nodes.flatMap((node) => {
    if (node.type !== 'folder') {
      return [node];
    }

    return flattenDemoAssets(node.children ?? []);
  });
}
