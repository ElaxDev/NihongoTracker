import { Schema, model } from 'mongoose';
import { IAnimeDocument } from '../types';

const AnimeSchema = new Schema<IAnimeDocument>({
  title: {
    type: String,
    required: true,
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
  description: {
    type: String,
    default: '',
  },
  coverImageLarge: {
    type: String,
  },
  episodes: {
    type: Number,
    required: true,
  },
  episodeDuration: {
    type: Number,
    default: 24,
  },
  releaseYear: {
    type: Number,
  },
  startedUserCount: {
    type: Number,
  },
  watchingUserCount: {
    type: Number,
  },
  finishedUserCount: {
    type: Number,
  },
  genres: {
    type: [String],
  },
});

export default model<IAnimeDocument>('Anime', AnimeSchema);
