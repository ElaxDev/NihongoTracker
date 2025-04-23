import { Schema, model } from 'mongoose';
import { IVisualNovelDetail } from '../types.js';

const VisualNovelDetailSchema = new Schema<IVisualNovelDetail>(
  {
    id: { type: String },
    olang: { type: String },
    image: { type: String },
    l_wikidata: { type: String },
    c_votecount: { type: Number },
    c_rating: { type: Number },
    c_average: { type: Number },
    length: { type: Number },
    devstatus: { type: Number },
    alias: { type: String },
    description: { type: String },
  },
  { collection: 'vn_details' }
);

export default model<IVisualNovelDetail>('VnDetail', VisualNovelDetailSchema);
