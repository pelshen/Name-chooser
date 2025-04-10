import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: true,
  apiVersion: '2024-04-10', // Use current date
});

export interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  publishedAt: string;
  excerpt?: string;
  body: any[];
  author?: {
    name: string;
    image?: {
      asset: {
        url: string;
      };
    };
  };
}

export interface Page {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  body: any[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}
