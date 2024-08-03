import { Schema, model } from 'mongoose';
import { IVisualNovelDocument } from '../types';

const VisualNovelSchema = new Schema<IVisualNovelDocument>({
  title: { type: String, required: true },
  publisher: { type: String, required: true },
  coverImage: { type: String, required: true },
  coverImageNSFW: { type: Boolean, default: false },
  vndbScore: { type: Number },
  vndbId: { type: Number, required: true, unique: true },
  approximatedCharCount: { type: Number },
  approximatedReadingTime: { type: Number },
  startedUserCount: { type: Number },
  readingUserCount: { type: Number },
  finishedUserCount: { type: Number },
  description: { type: String, required: true },
  adult: { type: Boolean, required: true, default: true },
});

export default model<IVisualNovelDocument>('VisualNovel', VisualNovelSchema);
