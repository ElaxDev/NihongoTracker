import { Schema, model } from 'mongoose';
import { IAnimeDocument } from '../types.js';

const AnimeSchema = new Schema<IAnimeDocument>({
  sources: {
    type: [String],
    uniqueItems: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'UNKNOWN'],
    required: true,
  },
  episodes: {
    type: Number,
    min: 0,
    default: 0,
  },
  status: {
    type: String,
    enum: ['FINISHED', 'ONGOING', 'UPCOMING', 'UNKNOWN'],
    required: true,
  },
  animeSeason: {
    season: {
      type: String,
      enum: ['SPRING', 'SUMMER', 'FALL', 'WINTER', 'UNDEFINED'],
      default: 'UNDEFINED',
    },
    year: {
      type: Number,
      min: 1907,
      required: true,
    },
  },
  picture: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  duration: {
    value: {
      type: Number,
      min: 1,
    },
    unit: {
      type: String,
      enum: ['SECONDS'],
    },
  },
  synonyms: {
    type: [String],
    uniqueItems: true,
  },
  relatedAnime: {
    type: [String],
    uniqueItems: true,
  },
  tags: {
    type: [String],
    uniqueItems: true,
  },
});

export default model<IAnimeDocument>('Anime', AnimeSchema);
