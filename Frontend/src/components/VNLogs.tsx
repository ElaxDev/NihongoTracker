import { IVNDocument, ILog } from '../types';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { fuzzy } from 'fast-fuzzy';
import { useMutation, useQuery } from '@tanstack/react-query';
import { assignMediaFn, searchVNFn } from '../api/trackerApi';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface VNLogsProps {
  logs: ILog[] | undefined;
}

function VNLogs({ logs }: VNLogsProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVN, setSelectedVN] = useState<IVNDocument | undefined>(
    undefined
  );
  const [selectedLogs, setSelectedLogs] = useState<ILog[]>([]);
  const [assignedLogs, setAssignedLogs] = useState<ILog[]>([]);

  const {
    data: VNResult,
    error: searchVNError,
    refetch: searchVN,
  } = useQuery({
    queryKey: ['VN', searchQuery],
    queryFn: () => searchVNFn({ title: searchQuery }),
    enabled: false,
  });

  if (searchVNError && searchVNError instanceof AxiosError) {
    toast.error(searchVNError.response?.data.message);
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

  const stripSymbols = useCallback((description: string) => {
    return description
      .replace(
        /[^a-zA-Z\u3040-\u30FF\u4E00-\u9FFF -]|(?<![a-zA-Z\u3040-\u30FF\u4E00-\u9FFF])-|-(?![a-zA-Z\u3040-\u30FF\u4E00-\u9FFF])/g,
        ''
      )
      .trim();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchVN();
    }
  }, [searchQuery, searchVN]);

  const groupedLogs = useMemo(() => {
    if (!logs) return [];
    const groupedLogs = new Map<string, ILog[]>();
    logs.forEach((log) => {
      if (!log.description || log.type !== 'vn' || log.contentId) return;
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

  const filteredGroupedLogs = useMemo(() => {
    if (!logs) return [];
    return groupedLogs
      ?.map((group) => {
        const filteredGroup = group.filter(
          (log) => !assignedLogs.includes(log)
        );
        return filteredGroup.length > 0 ? filteredGroup : null;
      })
      .filter((group) => !!group);
  }, [groupedLogs, assignedLogs, logs]);

  const { mutate: assignMedia } = useMutation({
    mutationFn: (data: {
      logsId: string[];
      mediaId: string;
      mediaType: string;
    }) => assignMediaFn(data.logsId, data.mediaId, data.mediaType),
    onSuccess: () => {
      toast.success('Media assigned successfully');
      setAssignedLogs((prev) => [...prev, ...selectedLogs]);
      setSelectedLogs([]);
      setSelectedVN(undefined);
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
    if (!selectedVN) {
      toast.error('You need to select at least one log!');
      return;
    }
    assignMedia({
      logsId: selectedLogs.map((log) => log._id),
      mediaId: selectedVN._id,
      mediaType: 'vn',
    });
  }, [selectedVN, selectedLogs, assignMedia]);

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
              {VNResult ? (
                <div>
                  {VNResult.map((VN, i) => (
                    <div
                      className="flex items-center gap-4 py-2 content-center"
                      key={i}
                    >
                      <label>
                        <input
                          type="radio"
                          className="radio"
                          name="VN"
                          checked={selectedVN?.title === VN.title}
                          onChange={() => setSelectedVN(VN)}
                        />
                      </label>
                      <div className="flex-grow">
                        <h2 className="text-lg inline-block font-medium align-middle">
                          {VN.latin ? VN.latin : VN.title}
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

export default VNLogs;
