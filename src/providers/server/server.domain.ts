import { Schema } from 'mongoose';

import { ServerModel } from './server.types';

export const getServerSite = (server: ServerModel, keyword: string) => {
  return server.keywordsMap[keyword] || undefined;
};

export const getServerSchema = () =>
  new Schema(
    {
      _id: String,
      keywordsMap: Object,
      updated: {
        type: Date,
        default: Date.now,
      },
    },
    {
      minimize: false,
    },
  );
