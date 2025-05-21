import { ILog, IMediaDocument } from '../types';
import { useState, useMemo, useCallback } from 'react';
import { fuzzy } from 'fast-fuzzy';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignMediaFn } from '../api/trackerApi';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import useSearch from '../hooks/useSearch';
import { useUserDataStore } from '../store/userData';
import { useFilteredGroupedLogs } from '../hooks/useFilteredGroupedLogs.tsx';

interface AnimeLogsProps {
  logs: ILog[] | undefined;
}

function AnimeLogs({ logs }: AnimeLogsProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnime, setSelectedAnime] = useState<
    IMediaDocument | undefined
  >(undefined);
  const [selectedLogs, setSelectedLogs] = useState<ILog[]>([]);
  const [assignedLogs, setAssignedLogs] = useState<ILog[]>([]);
  const [shouldAnilistSearch, setShouldAnilistSearch] = useState<boolean>(true);

  const { user } = useUserDataStore();
  const username = user?.username;

  const {
    data: animeResult,
    error: searchAnimeError,
    isLoading: isSearchingAnilist,
  } = useSearch('anime', shouldAnilistSearch ? searchQuery : '');

  const queryClient = useQueryClient();

  if (searchAnimeError && searchAnimeError instanceof AxiosError) {
    toast.error(searchAnimeError.response?.data.message);
  }

  const handleCheckboxChange = useCallback((log: ILog) => {
    setSelectedLogs((prevSelectedLogs) =>
      prevSelectedLogs.includes(log)
        ? prevSelectedLogs.filter((selectedLog) => selectedLog !== log)
        : [...prevSelectedLogs, log]
    );
  }, []);

  const handleOpenGroup = useCallback((group: ILog[] | null, title: string) => {
    if (!group) return;
    setSelectedLogs(group);
    setSearchQuery(title);
    setShouldAnilistSearch(true);
  }, []);

  const stripSymbols = useCallback((description: string) => {
    return description
      .replace(
        /[^a-zA-Z\u3040-\u30FF\u4E00-\u9FFF -]|(?<![a-zA-Z\u3040-\u30FF\u4E00-\u9FFF])-|-(?![a-zA-Z\u3040-\u30FF\u4E00-\u9FFF])/g,
        ''
      )
      .trim();
  }, []);

  const groupedLogs = useMemo(() => {
    if (!logs) return [];
    const groupedLogs = new Map<string, ILog[]>();
    logs.forEach((log) => {
      if (!log.description || log.type !== 'anime' || log.mediaId) return;
      let foundGroup = false;
      for (const [key, group] of groupedLogs) {
        if (fuzzy(key, log.description) > 0.8) {
          group.push(log);
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        groupedLogs.set(log.description, [log]);
      }
    });
    return Array.from(groupedLogs.values());
  }, [logs]);

  const filteredGroupedLogs = useFilteredGroupedLogs(
    logs,
    groupedLogs,
    assignedLogs
  );

  const { mutate: assignMedia } = useMutation({
    mutationFn: (
      data: {
        logsId: string[];
        contentMedia: IMediaDocument;
      }[]
    ) => assignMediaFn(data),
    onSuccess: () => {
      toast.success('Media assigned successfully');
      void queryClient.invalidateQueries({
        queryKey: ['logsAssign'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['logs', username],
      });
      setAssignedLogs((prev) => [...prev, ...selectedLogs]);
      setSelectedLogs([]);
      setSelectedAnime(undefined);
      setSearchQuery('');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error('Error assigning media');
      }
    },
  });

  const handleAssignMedia = useCallback(() => {
    if (!selectedAnime) {
      toast.error('You need to select at least one log!');
      return;
    }
    assignMedia([
      {
        logsId: selectedLogs.map((log) => log._id),
        contentMedia: {
          contentId: selectedAnime.contentId,
          contentImage: selectedAnime.contentImage,
          coverImage: selectedAnime.coverImage,
          description: selectedAnime.description,
          type: 'anime',
          title: {
            contentTitleNative: selectedAnime.title.contentTitleNative,
            contentTitleEnglish: selectedAnime.title.contentTitleEnglish,
            contentTitleRomaji: selectedAnime.title.contentTitleRomaji,
          },
          isAdult: selectedAnime.isAdult,
          ...(selectedAnime.episodes && {
            episodes: selectedAnime.episodes,
          }),
          ...(selectedAnime.episodeDuration && {
            duration: selectedAnime.episodeDuration,
          }),
        } as IMediaDocument,
      },
    ]);
    setShouldAnilistSearch(false);
  }, [selectedAnime, selectedLogs, assignMedia]);

  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-[50%_50%]">
        <div className="h-full max-h-screen">
          <div className="overflow-y-auto h-full">
            <div>
              <div className="join join-vertical">
                {filteredGroupedLogs.map((group, i) => (
                  <div
                    className="collapse collapse-arrow join-item border-base-300 border"
                    key={i}
                  >
                    <input
                      type="radio"
                      name="group"
                      onChange={() =>
                        handleOpenGroup(
                          group,
                          stripSymbols(
                            group && group[0]?.description
                              ? group[0].description
                              : ''
                          )
                        )
                      }
                    />
                    <div className="collapse-title text-xl font-medium">
                      {stripSymbols(
                        group && group[0]?.description
                          ? group[0].description
                          : ''
                      )}
                    </div>
                    <div className="collapse-content">
                      {group?.map((log, i) => (
                        <div
                          className="flex items-center gap-4 py-2 content-center"
                          key={i}
                        >
                          <label>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={selectedLogs.includes(log)}
                              onChange={() => handleCheckboxChange(log)}
                            />
                          </label>
                          <div className="grow">
                            <h2 className="text-lg inline-block font-medium align-middle">
                              {log.description}
                            </h2>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="h-full max-h-screen">
          <div className="flex flex-col px-4 gap-2 overflow-y-auto h-full">
            <label className="input input-bordered flex items-center gap-2">
              <input type="text" className="grow" placeholder="Search" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <div className="overflow-y-auto h-full">
              {isSearchingAnilist ? (
                <li>
                  <a>Loading...</a>
                </li>
              ) : null}
              {animeResult ? (
                <div>
                  {animeResult.map((anime, i) => (
                    <div
                      className="flex items-center gap-4 py-2 content-center"
                      key={i}
                    >
                      <label>
                        <input
                          type="radio"
                          className="radio"
                          name="anime"
                          checked={
                            selectedAnime?.title.contentTitleRomaji ===
                            anime.title.contentTitleRomaji
                          }
                          onChange={() => setSelectedAnime(anime)}
                        />
                      </label>
                      <div className="grow">
                        <h2 className="text-lg inline-block font-medium align-middle">
                          {anime.title.contentTitleRomaji}
                        </h2>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-lg">No results</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button onClick={handleAssignMedia} className="btn">
          Assign
        </button>
      </div>
    </div>
  );
}

export default AnimeLogs;
