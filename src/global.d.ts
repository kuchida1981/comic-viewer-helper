/**
 * Defined by Vite via define config
 */
declare global {
  const __APP_VERSION__: string;
  const __IS_UNSTABLE__: boolean;
}

export interface SiteAdapter {
  match: (url: string) => boolean;
  selectors: {
    container: string;
    images: string;
  };
  getImages?: () => HTMLImageElement[];
}

export {};
