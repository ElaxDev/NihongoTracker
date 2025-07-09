import { gql, GraphQLClient } from 'graphql-request';
import {
  AnilistSearchResult,
  IMediaDocument,
  SearchAnilistArgs,
} from '../types.js';

const query = gql`
  query ($search: String, $ids: [Int], $type: MediaType, $format: MediaFormat) {
    Page {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        id_in: $ids
        search: $search
        type: $type
        format: $format
        sort: SEARCH_MATCH
      ) {
        id
        title {
          romaji
          english
          native
        }
        type
        format
        coverImage {
          large
        }
        episodes
        duration
        chapters
        volumes
        synonyms
        isAdult
        bannerImage
        description
      }
    }
  }
`;

const anilist = new GraphQLClient('https://graphql.anilist.co');

export async function searchAnilist(variables: {
  search?: string | null;
  type?: 'ANIME' | 'MANGA' | null;
  format?: SearchAnilistArgs['format'];
  ids?: number[] | null;
}): Promise<IMediaDocument[]> {
  const cleanedVariables: SearchAnilistArgs = cleanVariables(
    variables
  ) as SearchAnilistArgs;
  const data: AnilistSearchResult = await anilist.request(
    query,
    cleanedVariables
  );

  if (!data.Page.media.length) return [];

  return data.Page.media.map((media) => ({
    contentId: media.id.toString(),
    title: {
      contentTitleNative: media.title.native,
      contentTitleRomaji: media.title.romaji,
      contentTitleEnglish: media.title.english,
    },
    contentImage: media.coverImage.large,
    coverImage: media.bannerImage,
    description: [{ description: media.description, language: 'eng' }],
    type: determineMediaType(media.type, media.format),
    ...(media.synonyms.length && {
      synonyms: media.synonyms.map((synonym) => synonym.trim()),
    }),
    ...(media.type === 'ANIME' && {
      episodes: media.episodes,
      episodeDuration: media.duration,
    }),
    ...(media.type === 'MANGA' && {
      chapters: media.chapters,
      volumes: media.volumes,
    }),
    isAdult: media.isAdult,
  })) as IMediaDocument[];
}

function cleanVariables<T extends object>(variables: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(variables).filter(
      ([_, value]) => value !== undefined && value !== null
    )
  ) as Partial<T>;
}

function determineMediaType(
  type: string,
  format: string
): 'anime' | 'manga' | 'reading' {
  if (type.toLowerCase() === 'anime' || type.toLowerCase() === 'music')
    return 'anime';
  if (format === 'MANGA' || format === 'ONE_SHOT') return 'manga';
  return 'reading';
}
