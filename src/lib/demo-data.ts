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
  replies?: DemoComment[];
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
  type: 'folder' | 'image' | 'video' | 'pdf' | 'doc' | 'ppt';
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
    account: 'Asset Harbor / Creative',
    status: 'Connected',
    syncedToday: 8,
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    account: 'Asset Harbor / GTM',
    status: 'Connected',
    syncedToday: 6,
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    account: 'Asset Harbor / Retail Ops',
    status: 'Syncing',
    syncedToday: 5,
  },
  {
    id: 'icloud-drive',
    name: 'iCloud Drive',
    account: 'Asset Harbor / Leadership',
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
                name: 'review-walkthrough-clip.mp4',
                type: 'video',
                description: 'Short sample MP4 synced from Dropbox to show browser video preview and threaded feedback in one queue.',
                preview: '/demo/files/sample-5s.mp4',
                status: 'Needs Work',
                source: 'Dropbox',
                sourcePath: '/Creative/Review Samples/review-walkthrough-clip.mp4',
                syncedAt: '2 min ago',
                syncedBy: 'Dropbox connector',
                version: 'v4',
                campaign: 'Demo Samples',
                owner: 'Creative Studio',
                reviews: { positive: 1, neutral: 1, negative: 2 },
                comments: [
                  {
                    id: 1,
                    author: 'Nadia',
                    time: '09:12',
                    anchor: '00:03',
                    markerPercent: 8,
                    content: 'This is a good stand-in for demoing timecoded notes, but the first frame should feel less static.',
                    reactions: [{ emoji: '👍', users: ['Eric'] }],
                  },
                  {
                    id: 2,
                    author: 'Eric',
                    time: '09:24',
                    anchor: '00:12',
                    markerPercent: 28,
                    content: 'Keep the clip short. It only needs to prove that native video can live in the same review flow as docs.',
                    reactions: [{ emoji: '❤️', users: ['Nadia', 'Manouk'] }],
                    replies: [
                      {
                        id: 201,
                        author: 'Nadia',
                        time: '09:31',
                        content: 'Agreed. This should feel like a quick preview, not a polished launch trailer.',
                        reactions: [{ emoji: '👍', users: ['Eric'] }],
                      },
                    ],
                  },
                  {
                    id: 3,
                    author: 'Manouk',
                    time: '09:40',
                    anchor: '00:34',
                    markerPercent: 61,
                    content: 'Use this file mainly to show comments on a real MP4. The exact content is less important than the workflow.',
                    reactions: [{ emoji: '👀', users: ['Chuck'] }],
                  },
                ],
                activity: [
                  {
                    id: 1,
                    author: 'Dropbox connector',
                    action: 'Synced new version',
                    detail: 'Imported the sample MP4 from the shared Dropbox review folder.',
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
                name: 'clouds-reference.jpg',
                type: 'image',
                description: 'Sample JPG synced from Dropbox to show image review beside PDFs, Office docs, and video files.',
                preview: '/demo/files/sample-clouds.jpg',
                status: 'In Review',
                source: 'Dropbox',
                sourcePath: '/Creative/Reference/clouds-reference.jpg',
                syncedAt: '18 min ago',
                syncedBy: 'Dropbox connector',
                version: 'v3',
                campaign: 'Demo Samples',
                owner: 'Packaging Team',
                reviews: { positive: 2, neutral: 1, negative: 0 },
                comments: [
                  {
                    id: 4,
                    author: 'Eric',
                    time: '10:05',
                    content: 'This works better than the generated artwork because it immediately reads as a real image file.',
                    reactions: [{ emoji: '👍', users: ['Lena', 'Manouk'] }],
                  },
                  {
                    id: 5,
                    author: 'Lena',
                    time: '10:14',
                    content: 'Keep one or two simple JPG references like this in the demo so image previews feel believable.',
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
                name: 'city-park-reference.jpg',
                type: 'image',
                description: 'Sample JPG synced from Google Drive to demonstrate mixed cloud image intake with a real source file.',
                preview: '/demo/files/sample-city-park.jpg',
                status: 'In Review',
                source: 'Google Drive',
                sourcePath: '/Planning/Reference/city-park-reference.jpg',
                syncedAt: '9 min ago',
                syncedBy: 'Google Drive connector',
                version: 'v6',
                campaign: 'Demo Samples',
                owner: 'Growth Team',
                reviews: { positive: 2, neutral: 1, negative: 0 },
                comments: [
                  {
                    id: 6,
                    author: 'Chuck',
                    time: '11:02',
                    content: 'This is a good second image to prove Google Drive files land in the same queue without looking synthetic.',
                    reactions: [{ emoji: '🔥', users: ['Manouk'] }],
                    replies: [
                      {
                        id: 202,
                        author: 'Manouk',
                        time: '11:08',
                        content: 'Yes. This feels much more like a real file than the old generated boards.',
                        reactions: [{ emoji: '👍', users: ['Chuck'] }],
                      },
                    ],
                  },
                  {
                    id: 7,
                    author: 'Manouk',
                    time: '11:17',
                    content: 'Keep this one available so the tour can show image preview right after the filters step.',
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
                name: 'project-brief.docx',
                type: 'doc',
                description: 'Word sample file synced from Google Drive to demonstrate native Office docs inside the same review queue.',
                preview: '/demo/files/project-brief.docx',
                status: 'Approved',
                source: 'Google Drive',
                sourcePath: '/Go To Market/Sample Docs/project-brief.docx',
                syncedAt: '42 min ago',
                syncedBy: 'Google Drive connector',
                version: 'final',
                campaign: 'Demo Samples',
                owner: 'Revenue Operations',
                reviews: { positive: 3, neutral: 0, negative: 0 },
                comments: [
                  {
                    id: 8,
                    author: 'Nadia',
                    time: '11:36',
                    content: 'Approved. Keeping one real Word file in the demo helps prove the app is not limited to images and PDFs.',
                    reactions: [{ emoji: '✅', users: ['Chuck', 'Manouk'] }],
                  },
                ],
                activity: [
                  {
                    id: 8,
                    author: 'Google Drive connector',
                    action: 'Imported Word doc',
                    detail: 'Added the project brief sample to the demo workspace.',
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
            name: 'signed-approval-scan.pdf',
            type: 'pdf',
            description: 'Scan-style PDF synced from OneDrive to demonstrate embedded document preview in the review pane.',
            preview: '/demo/files/pdf-scan-sample.pdf',
            status: 'Approved',
            source: 'OneDrive',
            sourcePath: '/Retail Ops/Sample Docs/signed-approval-scan.pdf',
            syncedAt: '6 min ago',
            syncedBy: 'OneDrive connector',
            version: 'approved',
            campaign: 'Demo Samples',
            owner: 'Retail Operations',
            reviews: { positive: 4, neutral: 0, negative: 0 },
            comments: [
              {
                id: 9,
                author: 'Chuck',
                time: '12:04',
                content: 'Approved. The embedded PDF preview makes the mixed-file story much easier to understand.',
                reactions: [{ emoji: '👍', users: ['Eric', 'Nadia'] }],
              },
            ],
            activity: [
              {
                id: 10,
                author: 'OneDrive connector',
                action: 'Synced approved file',
                detail: 'Imported the scan-style PDF from the OneDrive sample share.',
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
            name: 'quarterly-review-deck.pptx',
            type: 'ppt',
            description: 'PowerPoint sample file synced from iCloud Drive to show that slide decks can be reviewed in the same workspace.',
            preview: '/demo/files/quarterly-review-deck.pptx',
            status: 'In Review',
            source: 'iCloud Drive',
            sourcePath: '/Executive/Board Review/quarterly-review-deck.pptx',
            syncedAt: '11 min ago',
            syncedBy: 'iCloud Drive connector',
            version: 'rev-b',
            campaign: 'Demo Samples',
            owner: 'Leadership',
            reviews: { positive: 1, neutral: 1, negative: 0 },
            comments: [
              {
                id: 10,
                author: 'Manouk',
                time: '12:18',
                content: 'Keep one slide deck in the demo so people understand native presentation files can sit beside PDFs and media.',
                reactions: [{ emoji: '👍', users: ['Chuck'] }],
              },
            ],
            activity: [
              {
                id: 12,
                author: 'iCloud Drive connector',
                action: 'Synced slide deck',
                detail: 'Imported the PowerPoint sample from the leadership share.',
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
