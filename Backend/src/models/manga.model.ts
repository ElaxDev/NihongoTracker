import { Schema, model } from 'mongoose';
import { IMangaDocument } from '../types.js';

const mangaSchema = new Schema<IMangaDocument>({
  title: {
    type: String,
    required: true,
  },
  anilistScore: {
    type: Number,
  },
  adult: {
    type: Boolean,
    required: true,
    default: false,
  },
  anilistId: {
    type: Number,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  genres: {
    type: [String],
    required: true,
  },
  chapters: {
    type: Number,
    required: true,
  },
  volumes: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  approximatedCharCount: {
    type: Number,
  },
  approximatedReadingTime: {
    type: Number,
  },
  coverImage: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
});

export default model<IMangaDocument>('Manga', mangaSchema);
