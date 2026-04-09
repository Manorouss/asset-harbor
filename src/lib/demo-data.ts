export type DemoComment = {
  id: number;
  author: string;
  content: string;
  time: string;
};

export type DemoReview = {
  positive: number;
  neutral: number;
  negative: number;
};

export type DemoAsset = {
  id: string;
  name: string;
  type: 'folder' | 'image' | 'video' | 'pdf';
  description: string;
  preview?: string;
  status?: 'Approved' | 'Needs Work' | 'In Review';
  reviews?: DemoReview;
  comments?: DemoComment[];
  children?: DemoAsset[];
};

export const demoTree: DemoAsset[] = [
  {
    id: 'customers',
    name: '1 - Customers',
    type: 'folder',
    description: 'Client delivery materials and approved one-pagers.',
    children: [
      {
        id: 'customer-onboarding',
        name: 'Customer onboarding one-pager.pdf',
        type: 'pdf',
        description: 'Welcome packet used by account managers during kickoff.',
        preview: '/demo/customer-one-pager.svg',
        status: 'Approved',
        reviews: { positive: 3, neutral: 0, negative: 0 },
        comments: [
          {
            id: 1,
            author: 'Nadia',
            time: '09:12',
            content: 'This is ready for external sharing. The service timeline reads clearly.',
          },
          {
            id: 2,
            author: 'Eric',
            time: '09:40',
            content: 'Keep this as the baseline for future onboarding kits.',
          },
        ],
      },
    ],
  },
  {
    id: 'sales',
    name: '2 - Sales',
    type: 'folder',
    description: 'Pitch decks, campaign visuals, and outbound collateral.',
    children: [
      {
        id: 'sales-launch-board',
        name: 'Q2 launch board.png',
        type: 'image',
        description: 'Campaign board for the upcoming sales push.',
        preview: '/demo/launch-board.svg',
        status: 'In Review',
        reviews: { positive: 2, neutral: 1, negative: 0 },
        comments: [
          {
            id: 3,
            author: 'Chuck',
            time: '10:05',
            content: 'Strong hierarchy. I would keep the hero panel but trim the lower caption.',
          },
          {
            id: 4,
            author: 'Manouk',
            time: '10:18',
            content: 'Good enough for stakeholder review once we update the CTA line.',
          },
        ],
      },
    ],
  },
  {
    id: 'marketing',
    name: '3 - Marketing',
    type: 'folder',
    description: 'Social assets, event graphics, and promo concepts.',
    children: [
      {
        id: 'spring-social',
        name: 'Spring social cutdown.mp4',
        type: 'video',
        description: 'Short social teaser for launch week posts.',
        preview: '/demo/social-motion.svg',
        status: 'Needs Work',
        reviews: { positive: 1, neutral: 1, negative: 2 },
        comments: [
          {
            id: 5,
            author: 'Lena',
            time: '11:02',
            content: 'The first three seconds feel too static. Add motion sooner.',
          },
          {
            id: 6,
            author: 'Nadia',
            time: '11:30',
            content: 'Messaging is right, but the pacing needs to be more aggressive.',
          },
        ],
      },
    ],
  },
  {
    id: 'product-assets',
    name: '4 - Product Assets',
    type: 'folder',
    description: 'Packaging, product sheets, and launch visuals.',
    children: [
      {
        id: 'packaging-v3',
        name: 'Packaging concepts v3.png',
        type: 'image',
        description: 'Shelf-ready packaging concepts for the refreshed line.',
        preview: '/demo/packaging-concepts.svg',
        status: 'In Review',
        reviews: { positive: 2, neutral: 1, negative: 0 },
        comments: [
          {
            id: 7,
            author: 'Eric',
            time: '13:04',
            content: 'Direction is strong. Tighten the logo lockup and keep the background tone.',
          },
          {
            id: 8,
            author: 'Manouk',
            time: '13:26',
            content: 'This is the version I would take into the next stakeholder round.',
          },
        ],
      },
      {
        id: 'spec-sheet',
        name: 'Retail spec sheet.pdf',
        type: 'pdf',
        description: 'Reference sheet for retail partners and distributors.',
        preview: '/demo/spec-sheet.svg',
        status: 'Approved',
        reviews: { positive: 4, neutral: 0, negative: 0 },
        comments: [
          {
            id: 9,
            author: 'Chuck',
            time: '14:11',
            content: 'Approved. This can go into the shared customer portal.',
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
