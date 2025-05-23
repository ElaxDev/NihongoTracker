import { Schema, model } from 'mongoose';
import { IMediaDocument, IMediaTitle } from '../types.js';

const MediaTitle = new Schema<IMediaTitle>(
  {
    contentTitleNative: { type: String, required: true },
    contentTitleRomaji: { type: String, default: null },
    contentTitleEnglish: { type: String, default: null },
  },
  { _id: false }
);

const MediaBaseSchema = new Schema<IMediaDocument>(
  {
    title: { type: MediaTitle, required: true },
    contentId: { type: String, required: true, unique: true },
    contentImage: { type: String },
    coverImage: { type: String },
    description: { type: String },
    type: {
      type: String,
      required: true,
      enum: ['anime', 'manga', 'reading', 'vn', 'video'],
    },
    synonyms: { type: [String], default: null },
    isAdult: { type: Boolean, default: false },
  },
  { discriminatorKey: 'type', collection: 'media' }
);

const MediaBase = model<IMediaDocument>('Media', MediaBaseSchema);

const AnimeSchema = new Schema({
  episodes: { type: Number, required: true },
  episodeDuration: { type: Number },
});

const Anime = MediaBase.discriminator('anime', AnimeSchema);

const MangaSchema = new Schema({
  chapters: { type: Number, default: null },
  volumes: { type: Number, default: null },
});

const Manga = MediaBase.discriminator('manga', MangaSchema);

const Reading = MediaBase.discriminator('reading', MangaSchema);

export { MediaBase, Anime, Manga, Reading };
