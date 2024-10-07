import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { searchAnimeFn, getUserLogsFn, assignMediaFn } from '../api/trackerApi';
import { useUserDataStore } from '../store/userData';
import { IAnimeDocument, ILog } from '../types';
import { fuzzy } from 'fast-fuzzy';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { AxiosError } from 'axios';

function AssignMedia() {
  const { user } = useUserDataStore();
  const [selectedLogs, setSelectedLogs] = useState<ILog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAnime, setSelectedAnime] = useState<
    IAnimeDocument | undefined
  >(undefined);
  const [assignedLogs, setAssignedLogs] = useState<ILog[]>([]);

  const {
    data: logs,
    error: logError,
    isLoading: isLoadingLogs,
  } = useQuery({
    queryKey: ['logs', user?.username],
    queryFn: () => getUserLogsFn(user?.username as string, { limit: 0 }),
    staleTime: Infinity,
  });

  const {
    data: animeResult,
    error: searchAnimeError,
    refetch: searchAnime,
  } = useQuery({
    queryKey: ['anime', searchQuery],
    queryFn: () => searchAnimeFn({ title: searchQuery }),
    enabled: false,
  });

  const { mutate: assignMedia } = useMutation({
    mutationFn: (data: { logsId: string[]; mediaId: string }) =>
      assignMediaFn(data.logsId, data.mediaId),
    onSuccess: () => {
      toast.success('Media assigned successfully');
      setAssignedLogs((prev) => [...prev, ...selectedLogs]);
      setSelectedLogs([]);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error('Error assigning media');
      }
    },
  });

  if (searchAnimeError && searchAnimeError instanceof AxiosError) {
    toast.error(searchAnimeError.response?.data.message);
  }

  if (logError && logError instanceof AxiosError) {
    toast.error(logError.response?.data.message);
  }

  const handleCheckboxChange = useCallback((log: ILog) => {
    setSelectedLogs((prevSelectedLogs) =>
      prevSelectedLogs.includes(log)
        ? prevSelectedLogs.filter((selectedLog) => selectedLog !== log)
        : [...prevSelectedLogs, log]
    );
  }, []);

  const handleOpenGroup = useCallback((group: ILog[], title: string) => {
    setSelectedLogs(group);
    setSearchQuery(title);
  }, []);

  const groupedLogs = useMemo(() => {
    if (!logs) return [];

    const groupedLogs = new Map<string, ILog[]>();

    logs.forEach((log) => {
      if (!log.description || log.type !== 'anime' || log.contentId) return;
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

  const handleAssignMedia = useCallback(() => {
    if (!selectedAnime) {
      toast.error('You need to select a log!');
      return;
    }
    assignMedia({
      logsId: selectedLogs.map((log) => log._id),
      mediaId: selectedAnime._id,
    });
  }, [selectedAnime, selectedLogs, assignMedia]);

  const stripSymbols = useCallback((description: string) => {
    return description
      .replace(
        /[^a-zA-Z\u3040-\u30FF\u4E00-\u9FFF -]|(?<![a-zA-Z\u3040-\u30FF\u4E00-\u9FFF])-|-(?![a-zA-Z\u3040-\u30FF\u4E00-\u9FFF])/g,
        ''
      )
      .trim();
  }, []);

  const filteredGroupedLogs = useMemo(() => {
    console.log('logs:', logs);
    console.log('groupedLogs:', groupedLogs);
    console.log('assignedLogs:', assignedLogs);

    if (!logs) return [];

    return groupedLogs
      ?.map((group) => {
        const filteredGroup = group.filter(
          (log) => !assignedLogs.includes(log)
        );
        console.log('filteredGroup:', filteredGroup);
        return filteredGroup.length > 0 ? filteredGroup : null;
      })
      .filter((group) => !!group);
  }, [groupedLogs, assignedLogs, logs]);

  useEffect(() => {
    if (searchQuery) {
      searchAnime();
    }
  }, [searchQuery, searchAnime]);

  return (
    <div className="pt-24 py-16 flex flex-col justify-center items-center bg-base-300 min-h-screen">
      <div className="w-full grid grid-cols-[50%_50%]">
        <div className="h-full max-h-screen">
          <div className="overflow-y-auto h-full">
            {isLoadingLogs ? (
              <Loader />
            ) : logError ? (
              <div>Error loading logs</div>
            ) : (
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
                            stripSymbols(group[0].description)
                          )
                        }
                      />
                      <div className="collapse-title text-xl font-medium">
                        {stripSymbols(group[0].description)}
                      </div>
                      <div className="collapse-content">
                        {group.map((log, i) => (
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
                            <div className="flex-grow">
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
            )}
          </div>
        </div>
        <div className="flex flex-col px-4 gap-2">
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
                        checked={selectedAnime?.title === anime.title}
                        onChange={() => setSelectedAnime(anime)}
                      />
                    </label>
                    <div className="flex-grow">
                      <h2 className="text-lg inline-block font-medium align-middle">
                        {anime.title}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-lg">No results</div>
            )}
          </div>
          <div className="flex justify-center">
            <button onClick={handleAssignMedia} className="btn">
              Assign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignMedia;
