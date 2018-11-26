import { Schema } from 'mongoose';

export const serverSchema: Schema = new Schema(
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
