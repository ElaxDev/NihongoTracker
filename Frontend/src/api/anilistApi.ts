import { gql, GraphQLClient } from 'graphql-request';
import { AnilistSearchResult, IMediaDocument } from '../types';

const query = gql`
  query (
    $search: String
    $type: MediaType
    $format: MediaFormat
    $page: Int
    $perPage: Int
    $ids: [Int]
  ) {
    Page(page: $page, perPage: $perPage) {
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
          extraLarge
          medium
          large
          color
        }
        bannerImage
        siteUrl
        description
      }
    }
  }
`;

const anilist = new GraphQLClient('https://graphql.anilist.co');

interface SearchAnilistArgs {
  search: string;
  type?: string;
  page?: number;
  perPage?: number;
  format?: string;
  ids?: number[] | number;
}

export async function searchAnilist(
  search: string,
  type?: string,
  page: number = 1,
  perPage: number = 10,
  format?: string,
  ids?: number[] | number
): Promise<IMediaDocument[]> {
  const variables: SearchAnilistArgs = {
    search: search,
    type: type,
    page: page,
    perPage: perPage,
  };
  if (ids) variables['ids'] = ids;
  if (format) variables['format'] = format;
  if (!type) return [];

  const data: AnilistSearchResult = await anilist.request(query, variables);

  const media = data.Page.media.map((media) => ({
    contentId: media.id.toString(),
    title: {
      contentTitleNative: media.title.native,
      contentTitleRomaji: media.title.romaji,
      contentTitleEnglish: media.title.english,
    },
    contentImage: media.coverImage.large,
    coverImage: media.bannerImage,
    description: media.description,
    type: ((media.type.toLowerCase() as 'anime' | 'manga') === 'anime'
      ? 'anime'
      : media.format === 'MANGA' || media.format === 'ONE_SHOT'
      ? 'manga'
      : 'reading') as 'anime' | 'manga' | 'reading',
  }));

  return media;
}
