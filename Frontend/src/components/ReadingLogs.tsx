import { ILog, IMediaDocument } from '../types';
import { useState, useMemo, useCallback } from 'react';
import { fuzzy } from 'fast-fuzzy';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignMediaFn } from '../api/trackerApi.ts';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import useSearch from '../hooks/useSearch.tsx';
import { useUserDataStore } from '../store/userData.ts';
import { useFilteredGroupedLogs } from '../hooks/useFilteredGroupedLogs.tsx';

interface ReadingLogsProps {
  logs: ILog[] | undefined;
}

function ReadingLogs({ logs }: ReadingLogsProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReading, setSelectedReading] = useState<
    IMediaDocument | undefined
  >(undefined);
  const [selectedLogs, setSelectedLogs] = useState<ILog[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [assignedLogs, setAssignedLogs] = useState<ILog[]>([]);
  const [shouldSearch, setShouldSearch] = useState<boolean>(true);

  const { user } = useUserDataStore();
  const username = user?.username;

  const {
    data: readingResult,
    error: searchReadingError,
    isLoading: isSearchingReading,
  } = useSearch('reading', shouldSearch ? searchQuery : '');

  const queryClient = useQueryClient();

  if (searchReadingError && searchReadingError instanceof AxiosError) {
    toast.error(searchReadingError.response?.data.message);
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
      setShouldSearch(true);
    },
    []
  );

  const stripSymbols = useCallback((description: string) => {
    return description
      .replace(/\s*v\d+\s*$/i, '')
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
      if (!log.description || log.type !== 'reading' || log.mediaId) return;
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

  const { mutate: assignMedia, isPending: isAssigning } = useMutation({
    mutationFn: (
      data: {
        logsId: string[];
        contentMedia: IMediaDocument;
      }[]
    ) => assignMediaFn(data),
    onSuccess: () => {
      setAssignedLogs((prev) => [...prev, ...selectedLogs]);
      setSelectedLogs([]);
      setSelectedReading(undefined);
      setSearchQuery('');
      setSelectedGroup(null);

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['logsAssign'] });
        queryClient.invalidateQueries({ queryKey: ['logs', username] });
        queryClient.invalidateQueries({
          queryKey: ['ImmersionList', username],
        });
        toast.success('Media assigned successfully');
      }, 0);
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
    if (!selectedReading) {
      toast.error('You need to select a reading!');
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
          contentId: selectedReading.contentId,
          contentImage: selectedReading.contentImage,
          coverImage: selectedReading.coverImage,
          description: selectedReading.description,
          type: 'reading',
          title: {
            contentTitleNative: selectedReading.title.contentTitleNative,
            contentTitleEnglish: selectedReading.title.contentTitleEnglish,
            contentTitleRomaji: selectedReading.title.contentTitleRomaji,
          },
          isAdult: selectedReading.isAdult,
          ...(selectedReading.chapters && {
            chapters: selectedReading.chapters,
          }),
          ...(selectedReading.volumes && {
            volumes: selectedReading.volumes,
          }),
        } as IMediaDocument,
      },
    ]);
    setShouldSearch(false);
  }, [selectedReading, selectedLogs, assignMedia]);

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        Assign Reading to Logs
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
                <span>No unassigned reading logs found.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - Reading search */}
        <div className="card bg-base-200 shadow-lg">
          <div className="card-body p-4">
            <h2 className="card-title">Find Matching Reading</h2>
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
                placeholder="Search reading..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShouldSearch(true);
                }}
              />
            </label>

            <div className="overflow-y-auto max-h-[60vh]">
              {isSearchingReading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <p className="mt-2">Searching reading...</p>
                </div>
              ) : readingResult && readingResult.length > 0 ? (
                <div className="space-y-2">
                  {readingResult.map((reading, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 p-3 rounded-lg hover:bg-base-300 cursor-pointer ${
                        selectedReading?.contentId === reading.contentId
                          ? 'bg-primary/10 border border-primary'
                          : ''
                      }`}
                      onClick={() => setSelectedReading(reading)}
                    >
                      <div className="w-12">
                        <label className="cursor-pointer flex items-center justify-center h-full">
                          <input
                            type="radio"
                            className="radio radio-primary radio-sm"
                            name="reading"
                            checked={
                              selectedReading?.contentId === reading.contentId
                            }
                            onChange={() => setSelectedReading(reading)}
                          />
                        </label>
                      </div>

                      <div className="flex gap-3">
                        {reading.contentImage && (
                          <div className="w-12 h-16 overflow-hidden rounded-md">
                            <img
                              src={reading.contentImage}
                              alt={
                                reading.title.contentTitleEnglish ||
                                reading.title.contentTitleRomaji
                              }
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}

                        <div className="flex flex-col">
                          <span className="font-medium">
                            {reading.title.contentTitleRomaji}
                          </span>
                          {reading.title.contentTitleEnglish && (
                            <span className="text-sm opacity-70">
                              {reading.title.contentTitleEnglish}
                            </span>
                          )}
                          {reading.title.contentTitleNative && (
                            <span className="text-sm opacity-70">
                              {reading.title.contentTitleNative}
                            </span>
                          )}
                          <div className="flex gap-2 mt-1">
                            {reading.chapters && (
                              <span className="text-xs badge badge-sm">
                                {reading.chapters} chapters
                              </span>
                            )}
                            {reading.volumes && (
                              <span className="text-xs badge badge-sm">
                                {reading.volumes} volumes
                              </span>
                            )}
                          </div>
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
                  <span>No reading found. Try different keywords.</span>
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
                    Select a log group or enter a reading title to search
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
          disabled={
            isAssigning || !selectedReading || selectedLogs.length === 0
          }
          className={`btn btn-primary btn-lg ${isAssigning ? 'loading' : ''}`}
        >
          {isAssigning ? (
            <>
              <span className="loading loading-spinner"></span>
              Assigning...
            </>
          ) : (
            'Assign to Reading'
          )}
        </button>
      </div>
    </div>
  );
}

export default ReadingLogs;
