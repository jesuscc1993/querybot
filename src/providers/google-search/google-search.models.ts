export interface GoogleSearchOptions {
  [key: string]: any;
  cx: string;
  key: string;
  num?: number;
  safe?: string;
  siteSearch?: string;
  start?: number;
}

export interface GoogleSearchResult {
  items: GoogleSearchResultItem[];
}

export interface GoogleSearchResultItem {
  cacheId: string;
  displayLink: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  htmlSnippet: string;
  htmlTitle: string;
  kind: string;
  link: string;
  pagemap: {
    cse_image?: {
      src: string;
    }[];
    cse_thumbnail?: {
      width: string;
      height: string;
      src: string;
    }[];
    metatags?: {}[];
  };
  snippet: string;
  title: string;
}
