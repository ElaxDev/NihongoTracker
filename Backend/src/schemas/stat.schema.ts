import { z } from 'zod';

const StatSchemaValidator = z
  .strictObject({
    readingXp: z.number(),
    readingLevel: z.number(),
    listeningXp: z.number(),
    listeningLevel: z.number(),
    charCountVn: z.number(),
    charCountLn: z.number(),
    charCountReading: z.number(),
    pageCountLn: z.number(),
    readingTimeLn: z.number(),
    pageCountManga: z.number(),
    charCountManga: z.number(),
    readingTimeManga: z.number(),
    mangaPages: z.number(),
    listeningTime: z.number(),
    readingTime: z.number(),
    animeEpisodes: z.number(),
    animeWatchingTime: z.number(),
    videoWatchingTime: z.number(),
    lnCount: z.number(),
    readManga: z.string().array(),
    watchedAnime: z.string().array(),
    playedVn: z.string().array(),
    knownWords: z.string().array(),
  })
  .partial();

export default StatSchemaValidator;
