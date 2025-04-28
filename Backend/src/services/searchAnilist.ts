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
        bannerImage
        description
      }
    }
  }
`;

const anilist = new GraphQLClient('https://graphql.anilist.co');

export async function searchAnilist(variables: {
  _search?: string | null;
  _type?: 'ANIME' | 'MANGA' | null;
  _format?: SearchAnilistArgs['format'];
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
    description: media.description,
    type: determineMediaType(media.type, media.format),
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
