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
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
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

  const handleOpenGroup = useCallback(
    (group: ILog[] | null, title: string, groupIndex: number) => {
      if (!group) return;
      setSelectedGroup(groupIndex);
      setSelectedLogs(group);
      setSearchQuery(title);
      setShouldAnilistSearch(true);
    },
    []
  );

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

  // Add a function to reset the component state
  const resetState = useCallback(() => {
    setAssignedLogs((prev) => [...prev, ...selectedLogs]);
    setSelectedLogs([]);
    setSelectedAnime(undefined);
    setSearchQuery('');
    setSelectedGroup(null);
    setShouldAnilistSearch(false);
  }, [selectedLogs]);

  const { mutate: assignMedia, isPending: isAssigning } = useMutation({
    mutationFn: (
      data: {
        logsId: string[];
        contentMedia: IMediaDocument;
      }[]
    ) => assignMediaFn(data),
    onSuccess: () => {
      resetState();

      // Invalidate queries without setTimeout
      queryClient.invalidateQueries({ queryKey: ['logsAssign'] });
      queryClient.invalidateQueries({ queryKey: ['logs', username] });
      queryClient.invalidateQueries({ queryKey: ['ImmersionList', username] });

      // Show count of logs assigned in the success message
      toast.success(
        `Successfully assigned ${selectedLogs.length} logs to anime`
      );
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data.message || 'Server error during assignment'
          : error instanceof Error
            ? error.message
            : 'Unknown error during assignment';

      toast.error(errorMessage);
    },
  });

  const handleAssignMedia = useCallback(() => {
    if (!selectedAnime) {
      toast.error('You need to select an anime!');
      return;
    }
    if (selectedLogs.length === 0) {
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
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        Assign Anime to Logs
      </h1>

      <div className="stats shadow mb-4 w-full">
        <div className="stat">
          <div className="stat-title">Selected Logs</div>
          <div className="stat-value">{selectedLogs.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Available Groups</div>
          <div className="stat-value">{filteredGroupedLogs.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left panel - Log groups */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">
            <h2 className="card-title">Unassigned Logs</h2>
            <div className="divider my-1"></div>

            {filteredGroupedLogs.length > 0 ? (
              <div className="overflow-y-auto max-h-[60vh]">
                <div className="join join-vertical w-full">
                  {filteredGroupedLogs.map((group, i) => (
                    <div
                      className="collapse collapse-arrow join-item border border-base-300 bg-base-100"
                      key={i}
                    >
                      <input
                        type="radio"
                        name="log-accordion"
                        checked={i === selectedGroup}
                        onChange={() => {
                          handleOpenGroup(
                            group,
                            stripSymbols(
                              group && group[0]?.description
                                ? group[0].description
                                : ''
                            ),
                            i
                          );
                        }}
                      />
                      <div className="collapse-title font-medium">
                        <div className="flex items-center gap-2">
                          <div className="badge badge-primary">
                            {group?.length || 0}
                          </div>
                          <span className="text-sm md:text-base">
                            {stripSymbols(
                              group && group[0]?.description
                                ? group[0].description
                                : ''
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="collapse-content">
                        {group?.map((log, i) => (
                          <div
                            className="flex items-center gap-4 py-2 hover:bg-base-200 rounded-md px-2"
                            key={i}
                          >
                            <label onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-sm"
                                checked={selectedLogs.includes(log)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleCheckboxChange(log);
                                }}
                              />
                            </label>
                            <div className="grow">
                              <h3 className="text-sm">{log.description}</h3>
                              <p className="text-xs text-base-content/70">
                                {new Date(log.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>No unassigned anime logs found.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Anime search */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">
            <h2 className="card-title">Find Matching Anime</h2>
            <div className="divider my-1"></div>

            <label className="input input-bordered input-primary flex items-center gap-2 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 opacity-70"
              >
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                className="grow"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShouldAnilistSearch(true);
                }}
              />
            </label>

            <div className="overflow-y-auto max-h-[60vh]">
              {isSearchingAnilist ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="mt-2">Searching anime...</p>
                </div>
              ) : animeResult && animeResult.length > 0 ? (
                <div className="space-y-2">
                  {animeResult.map((anime, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 p-3 rounded-lg hover:bg-base-300 cursor-pointer ${
                        selectedAnime?.contentId === anime.contentId
                          ? 'bg-primary/10 border border-primary'
                          : ''
                      }`}
                      onClick={() => setSelectedAnime(anime)}
                    >
                      <div className="w-12">
                        <label className="cursor-pointer flex items-center justify-center h-full">
                          <input
                            type="radio"
                            className="radio radio-primary radio-sm"
                            name="anime"
                            checked={
                              selectedAnime?.contentId === anime.contentId
                            }
                            onChange={() => setSelectedAnime(anime)}
                          />
                        </label>
                      </div>

                      <div className="flex gap-3">
                        {anime.contentImage && (
                          <div className="w-12 h-16 overflow-hidden rounded-md">
                            <img
                              src={anime.contentImage}
                              alt={
                                anime.title.contentTitleEnglish ||
                                anime.title.contentTitleRomaji
                              }
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}

                        <div className="flex flex-col">
                          <span className="font-medium">
                            {anime.title.contentTitleRomaji}
                          </span>
                          {anime.title.contentTitleEnglish && (
                            <span className="text-sm opacity-70">
                              {anime.title.contentTitleEnglish}
                            </span>
                          )}
                          {anime.title.contentTitleNative && (
                            <span className="text-sm opacity-70">
                              {anime.title.contentTitleNative}
                            </span>
                          )}
                          {anime.episodes && (
                            <span className="text-xs badge badge-sm mt-1">
                              {anime.episodes} episodes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="alert alert-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>No anime found. Try different keywords.</span>
                </div>
              ) : (
                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>
                    Select a log group or enter an anime title to search
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Selected Logs</div>
            <div className="stat-value text-primary">{selectedLogs.length}</div>
          </div>
        </div>

        <button
          onClick={handleAssignMedia}
          disabled={isAssigning || !selectedAnime || selectedLogs.length === 0}
          className={`btn btn-primary btn-lg ${isAssigning ? 'loading' : ''}`}
        >
          {isAssigning ? (
            <>
              <span className="loading loading-spinner"></span>
              Assigning...
            </>
          ) : (
            'Assign to Anime'
          )}
        </button>
      </div>
    </div>
  );
}

export default AnimeLogs;
