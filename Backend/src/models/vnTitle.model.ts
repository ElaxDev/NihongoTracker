import { Schema, model } from 'mongoose';
import { IVisualNovelTitle } from '../types.js';

const VisualNovelTitleSchema = new Schema<IVisualNovelTitle>(
  {
    id: { type: String, required: true },
    lang: { type: String, required: true },
    official: { type: Boolean, required: true },
    title: { type: String, required: true },
    latin: { type: String },
    image: { type: String },
  },
  { collection: 'vn_titles' }
);

export default model<IVisualNovelTitle>('VnTitle', VisualNovelTitleSchema);
