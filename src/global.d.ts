/**
 * Defined by Vite via define config
 */
declare global {
  const __APP_VERSION__: string;
  const __IS_UNSTABLE__: boolean;
}

export interface SiteAdapter {
  match: (url: string) => boolean;
  getContainer: () => HTMLElement | null;
  getImages: () => HTMLImageElement[];
  getMetadata?: () => {
    title: string;
    tags: Array<{ text: string, href: string }>;
    relatedWorks: Array<{ title: string, href: string, thumb: string }>;
  };
}

export {};
