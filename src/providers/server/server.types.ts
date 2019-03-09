export type Schema = {
  _id: string;
  updated: {
    type: string;
    default: string;
  };
};

export type KeywordsMap = { [keyword: string]: string };

export type Server = {
  keywordsMap?: KeywordsMap;
} & Partial<Schema>;

export type SiteKeyword = {
  keyword: string;
  url: string;
};
