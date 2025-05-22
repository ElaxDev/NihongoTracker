import React, { useEffect, useRef, useState } from 'react';
import { ICreateLog, ILog, IMediaDocument } from '../types';
import { createLogFn } from '../api/trackerApi';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSearch from '../hooks/useSearch';
import { DayPicker } from 'react-day-picker';
import { useUserDataStore } from '../store/userData';

interface logDataType {
  type: ILog['type'] | null;
  titleNative: string;
  titleRomaji: string;
  titleEnglish: string;
  description: string;
  mediaDescription: string;
  mediaName: string;
  mediaId: string;
  episodes: number;
  duration: number;
  synonyms: string[];
  isAdult: boolean;
  watchedEpisodes: number;
  time: number;
  chars: number;
  readChars: number;
  pages: number;
  readPages: number;
  chapters: undefined | number;
  volumes: undefined | number;
  hours: number;
  minutes: number;
  showTime: boolean;
  showChars: boolean;
  img: undefined | string;
  cover: undefined | string;
  date: Date | undefined;
}

function LogScreen() {
  const [logData, setLogData] = useState<logDataType>({
    type: null,
    titleNative: '',
    titleRomaji: '',
    titleEnglish: '',
    description: '',
    mediaDescription: '',
    mediaName: '',
    mediaId: '',
    episodes: 0,
    duration: 0,
    synonyms: [],
    isAdult: false,
    watchedEpisodes: 0,
    time: 0,
    chars: 0,
    readChars: 0,
    pages: 0,
    readPages: 0,
    chapters: undefined,
    volumes: undefined,
    hours: 0,
    minutes: 0,
    showTime: false,
    showChars: false,
    img: undefined,
    cover: undefined,
    date: undefined,
  });

  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [shouldAnilistSearch, setShouldAnilistSearch] = useState(true);
  const [isAdvancedOptions, setIsAdvancedOptions] = useState<boolean>(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const { user } = useUserDataStore();

  const {
    data: searchResult,
    error: searchError,
    isLoading: isSearching,
  } = useSearch(
    shouldAnilistSearch ? (logData.type ?? '') : '',
    shouldAnilistSearch ? logData.mediaName : ''
  );

  const queryClient = useQueryClient();

  const { mutate: createLog, isPending: isLogCreating } = useMutation({
    mutationFn: createLogFn,
    onSuccess: () => {
      setLogData({
        type: null,
        titleNative: '',
        titleRomaji: '',
        titleEnglish: '',
        description: '',
        mediaDescription: '',
        mediaName: '',
        mediaId: '',
        episodes: 0,
        duration: 0,
        synonyms: [],
        isAdult: false,
        watchedEpisodes: 0,
        time: 0,
        chars: 0,
        readChars: 0,
        pages: 0,
        readPages: 0,
        chapters: 0,
        volumes: 0,
        hours: 0,
        minutes: 0,
        showTime: false,
        showChars: false,
        img: undefined,
        cover: undefined,
        date: undefined,
      });
      setShouldAnilistSearch(false);
      void queryClient.invalidateQueries({
        predicate: (query) =>
          ['logs', user?.username, 'user'].includes(
            query.queryKey[0] as string
          ),
      });
      toast.success('Log created successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data.message
          : 'An error occurred';
      toast.error(errorMessage);
    },
  });

  const handleInputChange = (
    field: keyof typeof logData,
    value: string | number | null | Date | boolean | string[] | undefined
  ) => {
    setLogData((prev) => ({ ...prev, [field]: value }));
  };

  const preventNegativeValues = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.valueAsNumber < 0) e.target.value = '0';
  };

  const handleSuggestionClick = (group: IMediaDocument) => {
    handleInputChange('titleNative', group.title.contentTitleNative);
    handleInputChange('titleRomaji', group.title.contentTitleRomaji ?? '');
    handleInputChange('titleEnglish', group.title.contentTitleEnglish ?? '');
    handleInputChange('mediaId', group.contentId);
    handleInputChange('cover', group.coverImage ?? '');
    handleInputChange(
      'mediaName',
      group.title.contentTitleRomaji
        ? group.title.contentTitleRomaji
        : group.title.contentTitleEnglish
          ? group.title.contentTitleEnglish
          : group.title.contentTitleNative
    );
    handleInputChange('synonyms', group.synonyms ?? []);
    handleInputChange('isAdult', group.isAdult);
    handleInputChange('duration', group.episodeDuration ?? 0);
    handleInputChange('img', group.contentImage ?? '');
    handleInputChange('mediaDescription', group.description);
    handleInputChange('episodes', group.episodes ?? 0);
    setIsSuggestionsOpen(false);
  };

  const logSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const totalMinutes = logData.hours * 60 + logData.minutes;
    createLog({
      type: logData.type,
      mediaId: logData.mediaId,
      description: logData.description || logData.mediaName,
      mediaData: {
        contentId: logData.mediaId,
        contentTitleNative: logData.titleNative,
        contentTitleRomaji: logData.titleRomaji,
        contentTitleEnglish: logData.titleEnglish,
        contentImage: logData.img,
        coverImage: logData.cover,
        description: logData.mediaDescription,
        episodes: logData.episodes,
        episodeDuration: logData.duration,
        chapters: logData.chapters,
        volumes: logData.volumes,
        isAdult: logData.isAdult,
        synonyms: logData.synonyms,
      },
      episodes: logData.watchedEpisodes,
      time: totalMinutes || undefined,
      chars: logData.chars,
      pages: logData.pages,
      date: logData.date,
    } as ICreateLog);
  };

  useEffect(() => {
    if (searchError) toast.error(`Error: ${searchError.message}`);
    if (
      logData.mediaName &&
      ['anime', 'manga', 'reading', 'vn'].includes(logData.type ?? '')
    ) {
      setShouldAnilistSearch(true);
    }
  }, [searchError, logData.mediaName, logData.type]);

  return (
    <div className="pt-32 py-16 flex justify-center items-center bg-base-200 min-h-screen">
      <div className="card min-w-96 bg-base-100">
        <div className="card-body flex-row gap-12">
          <div className="flex flex-row gap-4">
            <div className="flex flex-col gap-4">
              <h1 className="font-bold text-xl">Log</h1>
              <form onSubmit={logSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Select the log type</span>
                  </label>
                  <select
                    className="select select-bordered w-full max-w-xs"
                    onChange={(e) =>
                      handleInputChange('type', e.target.value as ILog['type'])
                    }
                    value={logData.type || 'Log type'}
                  >
                    <option disabled value="Log type">
                      Log type
                    </option>
                    <option value="anime">Anime</option>
                    <option value="manga">Manga</option>
                    <option value="vn">Visual novels</option>
                    <option value="video">Video</option>
                    <option value="reading">Reading</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
                {logData.type && (
                  <>
                    <div>
                      <label className="label">
                        <span className="label-text">
                          Write the name of the media
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Media name"
                        className="input input-bordered w-full max-w-xs"
                        onFocus={() => setIsSuggestionsOpen(true)}
                        onBlur={() => {
                          setTimeout(() => setIsSuggestionsOpen(false), 200); // Delay closing
                        }}
                        onChange={(e) =>
                          handleInputChange('mediaName', e.target.value)
                        }
                        value={logData.mediaName}
                      />
                      <div
                        ref={suggestionRef}
                        className={`dropdown dropdown-open z-50 ${
                          isSuggestionsOpen && searchResult ? 'block' : 'hidden'
                        }`}
                      >
                        <ul className="dropdown-content menu bg-base-200 rounded-box w-full shadow-lg mt-2 absolute">
                          {isSearching ? (
                            <li>
                              <a>Loading...</a>
                            </li>
                          ) : searchResult?.length === 0 ? (
                            <li>
                              <a>No results found</a>
                            </li>
                          ) : (
                            searchResult?.map((group, i) => (
                              <li
                                key={i}
                                onClick={() => handleSuggestionClick(group)}
                              >
                                <a>{group.title.contentTitleNative}</a>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                    {logData.type === 'anime' && (
                      <div>
                        <label className="label">
                          <span className="label-text">How many episodes?</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          onInput={preventNegativeValues}
                          placeholder="Episodes"
                          className="input input-bordered w-full max-w-xs"
                          onChange={(e) =>
                            handleInputChange(
                              'watchedEpisodes',
                              Number(e.target.value)
                            )
                          }
                          value={logData.watchedEpisodes}
                        />
                      </div>
                    )}
                    <label className="label">
                      <input
                        type="checkbox"
                        className="checkbox"
                        onChange={() => setIsAdvancedOptions(true)}
                        checked={isAdvancedOptions}
                      />
                      Advanced options
                    </label>
                    {isAdvancedOptions ||
                    logData.type === 'vn' ||
                    logData.type === 'video' ||
                    logData.type === 'reading' ||
                    logData.type === 'audio' ||
                    logData.type === 'manga' ? (
                      <>
                        <div>
                          <label className="label">
                            <span className="label-text">Time spent</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            onInput={preventNegativeValues}
                            placeholder="Time in minutes"
                            className="input input-bordered w-full max-w-xs"
                            onChange={(e) =>
                              handleInputChange('time', Number(e.target.value))
                            }
                            value={logData.time}
                          />
                        </div>
                      </>
                    ) : null}
                    {isAdvancedOptions ||
                    logData.type === 'vn' ||
                    logData.type === 'reading' ||
                    logData.type === 'manga' ? (
                      <>
                        <div>
                          <label className="label">
                            <span className="label-text">Characters read</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            onInput={preventNegativeValues}
                            placeholder="Characters"
                            className="input input-bordered w-full max-w-xs"
                            onChange={(e) =>
                              handleInputChange(
                                'readChars',
                                Number(e.target.value)
                              )
                            }
                            value={logData.readChars}
                          />
                        </div>
                      </>
                    ) : null}
                    {isAdvancedOptions || logData.type === 'manga' ? (
                      <>
                        <div>
                          <label className="label">
                            <span className="label-text">Pages read</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            onInput={preventNegativeValues}
                            placeholder="Pages"
                            className="input input-bordered w-full max-w-xs"
                            onChange={(e) =>
                              handleInputChange(
                                'readPages',
                                Number(e.target.value)
                              )
                            }
                            value={logData.readPages}
                          />
                        </div>
                      </>
                    ) : null}
                    {isAdvancedOptions && (
                      <>
                        <button
                          data-popover-target="rdp-popover"
                          className="input input-border"
                          style={{ anchorName: '--rdp' } as React.CSSProperties}
                          type="button"
                        >
                          {logData.date instanceof Date
                            ? logData.date.toLocaleDateString()
                            : 'Pick a date'}
                        </button>
                        <div
                          data-popover="auto"
                          id="rdp-popover"
                          className="dropdown"
                          style={
                            { positionAnchor: '--rdp' } as React.CSSProperties
                          }
                        >
                          <DayPicker
                            className="react-day-picker"
                            mode="single"
                            selected={logData.date || undefined}
                            onSelect={(date) =>
                              handleInputChange('date', date || null)
                            }
                          />
                        </div>
                      </>
                    )}
                    <button
                      className="btn btn-neutral text-neutral-content w-24 mt-2"
                      type="submit"
                    >
                      {isLogCreating ? 'Loading...' : 'Submit'}
                    </button>
                  </>
                )}
              </form>
            </div>
            {logData.img && (
              <div className="mt-4">
                <img
                  src={logData.img}
                  alt="Selected Media"
                  className="rounded-lg shadow-lg w-64"
                />
                <div className="text-center mt-2">
                  <h2 className="font-bold text-lg">{logData.mediaName}</h2>
                  {logData.type === 'anime' && (
                    <p className="text-sm text-gray-500">
                      {logData.episodes} episodes
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogScreen;
