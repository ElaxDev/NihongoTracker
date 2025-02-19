import { gql, GraphQLClient } from 'graphql-request';
import { AnilistSearchResult } from '../types';

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
        siteUrl
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
): Promise<AnilistSearchResult> {
  const variables: SearchAnilistArgs = {
    search: search,
    type: type,
    page: page,
    perPage: perPage,
  };
  if (ids) variables['ids'] = ids;
  if (format) variables['format'] = format;
  if (!type)
    return {
      Page: {
        pageInfo: {
          total: 0,
          currentPage: 0,
          lastPage: 0,
          hasNextPage: false,
          perPage: 0,
        },
        media: [],
      },
    };
  return anilist.request(query, variables);
}
