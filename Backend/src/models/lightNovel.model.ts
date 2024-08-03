import { Schema, model } from 'mongoose';
import { ILightNovelDocument } from '../types';

const lightNovelSchema = new Schema<ILightNovelDocument>({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
  },
  description: {
    type: String,
  },
  coverImage: {
    type: String,
    required: true,
  },
  genres: {
    type: [String],
  },
  startDate: {
    type: String,
  },
  endDate: {
    type: String,
  },
  anilistId: {
    type: Number,
    required: true,
    unique: true,
  },
  adult: {
    type: Boolean,
    required: true,
    default: false,
  },
  approximatedCharCount: {
    type: Number,
  },
  approximatedReadingTime: {
    type: Number,
  },
  startedUserCount: {
    type: Number,
  },
  readingUserCount: {
    type: Number,
  },
  finishedUserCount: {
    type: Number,
  },
});

export default model<ILightNovelDocument>('LightNovel', lightNovelSchema);
