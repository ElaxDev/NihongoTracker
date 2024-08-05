import { gql, GraphQLClient } from 'graphql-request';
import { AnilistSearchResult } from '../types';

const query = gql`
  query (
    $search: String
    $type: MediaType
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
      media(id_in: $ids, search: $search, type: $type, sort: SEARCH_MATCH) {
        id
        title {
          romaji
          english
          native
        }
        type
        coverImage {
          extraLarge
          medium
          large
          color
        }
      }
    }
  }
`;

const anilist = new GraphQLClient('https://graphql.anilist.co');

export async function searchAnilist(
  search: string,
  type: string,
  page: number = 1,
  perPage: number = 10,
  ids?: number[] | number
): Promise<AnilistSearchResult> {
  console.log({
    search: search,
    type: type,
    page: page,
    perPage: perPage,
    ids: ids,
  });
  const variables = {
    search: search,
    type: type,
    page: page,
    perPage: perPage,
    ids: ids,
  };
  return await anilist.request(query, variables);
}
