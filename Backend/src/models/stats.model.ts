import { Schema, model } from 'mongoose';
import { IStats } from '../types';

const StatsSchema = new Schema<IStats>(
  {
    userLevel: { type: Number, required: true, default: 1 },
    readingXp: { type: Number, required: true, default: 0 },
    readingLevel: { type: Number, required: true, default: 1 },
    listeningXp: { type: Number, required: true, default: 0 },
    listeningLevel: { type: Number, required: true, default: 1 },
    charCountVn: { type: Number, required: true, default: 0 },
    charCountLn: { type: Number, required: true, default: 0 },
    readingTimeVn: { type: Number, required: true, default: 0 },
    charCountReading: { type: Number, required: true, default: 0 },
    pageCountLn: { type: Number, required: true, default: 0 },
    readingTimeLn: { type: Number, required: true, default: 0 },
    pageCountManga: { type: Number, required: true, default: 0 },
    charCountManga: { type: Number, required: true, default: 0 },
    readingTimeManga: { type: Number, required: true, default: 0 },
    mangaPages: { type: Number, required: true, default: 0 },
    listeningTime: { type: Number, required: true, default: 0 },
    readingTime: { type: Number, required: true, default: 0 },
    animeEpisodes: { type: Number, required: true, default: 0 },
    animeWatchingTime: { type: Number, required: true, default: 0 },
    videoWatchingTime: { type: Number, required: true, default: 0 },
    lnCount: { type: Number, required: true, default: 0 },
    readManga: { type: [String], required: true, default: [] },
    watchedAnime: { type: [String], required: true, default: [] },
    playedVn: { type: [String], required: true, default: [] },
    readLn: { type: [String], required: true, default: [] },
  },
  { timestamps: { updatedAt: 'lastUpdated' } }
);

export default model<IStats>('Stats', StatsSchema);
