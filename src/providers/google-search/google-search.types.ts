export type GoogleSearchError = {
  message: string;
};

export type GoogleSearchOptions = {
  [key: string]: any;
  cx: string;
  key: string;
  num?: number;
  safe?: string;
  siteSearch?: string;
  start?: number;
};

export type GoogleSearchResult = {
  items: GoogleSearchResultItem[];
  error?: GoogleSearchError;
};

export type GoogleSearchResultItem = {
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
};
