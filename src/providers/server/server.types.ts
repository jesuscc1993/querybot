import { DocumentSchema } from '../../persistence/dao.types';

export type KeywordsMap = { [keyword: string]: string };

export type ServerModel = DocumentSchema<{
  keywordsMap: KeywordsMap;
}>;

export type SiteKeyword = {
  keyword: string;
  url: string;
};
