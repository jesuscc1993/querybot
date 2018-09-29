import { Schema } from 'mongoose';

export const sitesSchema: Schema = new Schema({
  _id: String,
  sites: Object
});