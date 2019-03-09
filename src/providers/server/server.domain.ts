import { Schema } from 'mongoose';

import { Server } from './server.types';

export const getServerKeywordsMap = (server: Server) => (server ? server.keywordsMap : undefined);

export const getServerSite = (server: Server, keyword: string) => (server && server.keywordsMap ? server.keywordsMap[keyword] : undefined);

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
