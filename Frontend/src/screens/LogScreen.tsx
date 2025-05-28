import React, { useEffect, useRef, useState } from 'react';
import { ICreateLog, ILog, ILoginResponse, IMediaDocument } from '../types';
import { createLogFn, getUserFn } from '../api/trackerApi';
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
  const { user, setUser } = useUserDataStore();

  const {
    data: searchResult,
    error: searchError,
    isLoading: isSearching,
  } = useSearch(
    shouldAnilistSearch ? (logData.type ?? '') : '',
    shouldAnilistSearch ? logData.mediaName : '',
    undefined,
    1,
    5
  );

  const queryClient = useQueryClient();
  const datePickerRef = useRef<HTMLDialogElement>(null);

  const openDatePicker = () => {
    datePickerRef.current?.showModal();
  };

  const { mutate: createLog, isPending: isLogCreating } = useMutation({
    mutationFn: createLogFn,
    onSuccess: async () => {
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

      if (user?.username) {
        try {
          const updatedUser = await getUserFn(user.username);

          const loginResponse: ILoginResponse = {
            _id: updatedUser._id,
            username: updatedUser.username,
            stats: updatedUser.stats,
            avatar: updatedUser.avatar,
            titles: updatedUser.titles,
            roles: updatedUser.roles,
            discordId: updatedUser.discordId,
          };
          setUser(loginResponse);
        } catch (e) {
          console.error('Error fetching user data:', e);
        }
      }
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
      chars: logData.readChars || undefined,
      pages: logData.readPages,
      date: logData.date,
    } as ICreateLog);
  };

  useEffect(() => {
    if (searchError) toast.error(`Error: ${searchError.message}`);
    if (
      logData.mediaName &&
      ['anime', 'manga', 'reading', 'vn'].includes(logData.type ?? '') &&
      !['video', 'audio'].includes(logData.type ?? '')
    ) {
      setShouldAnilistSearch(true);
    } else if (['video', 'audio'].includes(logData.type ?? '')) {
      setShouldAnilistSearch(false);
    }
  }, [searchError, logData.mediaName, logData.type]);

  return (
    <div className="pt-24 pb-16 px-4 flex justify-center items-start bg-base-200 min-h-screen">
      <div className="card w-full max-w-3xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl mb-6">Create New Log</h1>

          <form onSubmit={logSubmit} className="space-y-6">
            {/* Log Type Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Log Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                onChange={(e) =>
                  handleInputChange('type', e.target.value as ILog['type'])
                }
                value={logData.type || 'Log type'}
              >
                <option disabled value="Log type">
                  Select a log type
                </option>
                <option value="anime">Anime</option>
                <option value="manga">Manga</option>
                <option value="vn">Visual Novel</option>
                <option value="video">Video</option>
                <option value="reading">Reading</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            {logData.type && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Media Name Input with Suggestions */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Media Name</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search for media..."
                        className="input input-bordered w-full"
                        onFocus={() => setIsSuggestionsOpen(true)}
                        onBlur={() => {
                          setTimeout(() => setIsSuggestionsOpen(false), 200);
                        }}
                        onChange={(e) =>
                          handleInputChange('mediaName', e.target.value)
                        }
                        value={logData.mediaName}
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="loading loading-spinner loading-sm"></span>
                        </div>
                      )}
                    </div>

                    {/* Search Suggestions */}
                    <div ref={suggestionRef} className="relative">
                      {isSuggestionsOpen &&
                        searchResult &&
                        searchResult.length > 0 && (
                          <ul className="menu menu-vertical bg-base-200 rounded-box w-full shadow-lg mt-1 absolute z-50 overflow-y-auto">
                            {searchResult.map((group, i) => (
                              <li
                                key={i}
                                onClick={() => handleSuggestionClick(group)}
                                className="w-full"
                              >
                                <a className="flex items-center gap-2 w-full whitespace-normal">
                                  {group.contentImage && (
                                    <div className="avatar w-8 h-8 flex-shrink-0">
                                      <div className="w-full h-full rounded">
                                        <img
                                          src={group.contentImage}
                                          alt={group.title.contentTitleNative}
                                          className="object-cover"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0 w-full pr-2">
                                    <div className="truncate">
                                      {group.title.contentTitleRomaji ||
                                        group.title.contentTitleNative}
                                    </div>
                                    <div className="text-xs opacity-70 truncate">
                                      {group.title.contentTitleNative}
                                    </div>
                                  </div>
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      {isSuggestionsOpen && isSearching && (
                        <div className="alert mt-1">
                          <span className="loading loading-spinner loading-sm"></span>
                          <span>Searching...</span>
                        </div>
                      )}
                      {isSuggestionsOpen &&
                        !isSearching &&
                        searchResult?.length === 0 &&
                        logData.mediaName && (
                          <div className="alert alert-info mt-1">
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
                              No results found. You can still create a log with
                              this name.
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Episodes Input for Anime */}
                  {logData.type === 'anime' && (
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Episodes Watched
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        onInput={preventNegativeValues}
                        placeholder="Number of episodes"
                        className="input input-bordered w-full"
                        onChange={(e) =>
                          handleInputChange(
                            'watchedEpisodes',
                            Number(e.target.value)
                          )
                        }
                        value={logData.watchedEpisodes || ''}
                      />
                      {logData.episodes > 0 && (
                        <label className="label">
                          <span className="label-text-alt">
                            Total episodes: {logData.episodes}
                          </span>
                        </label>
                      )}
                    </div>
                  )}

                  {/* Advanced Options Toggle */}
                  <div className="collapse collapse-arrow border border-base-300 bg-base-200 rounded-box">
                    <input
                      type="checkbox"
                      checked={isAdvancedOptions}
                      onChange={() => setIsAdvancedOptions(!isAdvancedOptions)}
                    />
                    <div className="collapse-title font-medium">
                      Advanced Options
                    </div>
                    <div className="collapse-content space-y-4">
                      {/* Time Spent Input */}
                      {(isAdvancedOptions ||
                        ['vn', 'video', 'reading', 'audio', 'manga'].includes(
                          logData.type || ''
                        )) && (
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Time Spent</span>
                          </label>
                          <div className="join">
                            <label className="input input-bordered join-item w-1/2">
                              <span className="label">Hours</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                onChange={(e) =>
                                  handleInputChange(
                                    'hours',
                                    Number(e.target.value)
                                  )
                                }
                                value={logData.hours || ''}
                                onInput={preventNegativeValues}
                              />
                            </label>
                            <label className="input input-bordered join-item w-1/2">
                              <span className="label">Minutes</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                onChange={(e) =>
                                  handleInputChange(
                                    'minutes',
                                    Number(e.target.value)
                                  )
                                }
                                value={logData.minutes || ''}
                                onInput={preventNegativeValues}
                              />
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Characters Read Input */}
                      {(isAdvancedOptions ||
                        ['vn', 'reading', 'manga'].includes(
                          logData.type || ''
                        )) && (
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Characters Read</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            onInput={preventNegativeValues}
                            placeholder="Number of characters"
                            className="input input-bordered w-full"
                            onChange={(e) =>
                              handleInputChange(
                                'readChars',
                                Number(e.target.value)
                              )
                            }
                            value={logData.readChars || ''}
                          />
                        </div>
                      )}

                      {/* Pages Read Input */}
                      {(isAdvancedOptions || logData.type === 'manga') && (
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">Pages Read</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            onInput={preventNegativeValues}
                            placeholder="Number of pages"
                            className="input input-bordered w-full"
                            onChange={(e) =>
                              handleInputChange(
                                'readPages',
                                Number(e.target.value)
                              )
                            }
                            value={logData.readPages || ''}
                          />
                        </div>
                      )}

                      {/* Date Picker */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Date</span>
                        </label>
                        <div className="w-full">
                          <button
                            type="button"
                            onClick={openDatePicker}
                            className="input input-bordered w-full text-left flex items-center"
                          >
                            {logData.date instanceof Date
                              ? logData.date.toLocaleDateString()
                              : 'Select date (defaults to today)'}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 ml-auto"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Custom Description */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">
                            Custom Description (Optional)
                          </span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered w-full"
                          placeholder="Add your own notes about this log"
                          onChange={(e) =>
                            handleInputChange('description', e.target.value)
                          }
                          value={logData.description}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Preview Card */}
                <div className="flex flex-col items-center justify-start">
                  {logData.img &&
                  !['video', 'audio'].includes(logData.type || '') ? (
                    <div className="card bg-base-200 shadow-md w-full">
                      <figure className="px-4 pt-4">
                        <img
                          src={logData.img}
                          alt="Selected Media"
                          className="rounded-lg max-h-64 object-contain"
                        />
                      </figure>
                      <div className="card-body pt-2">
                        <h2 className="card-title text-center">
                          {logData.mediaName}
                        </h2>
                        {logData.episodes > 0 && (
                          <div className="badge badge-primary">
                            {logData.episodes} episodes
                          </div>
                        )}
                        {logData.isAdult && (
                          <div className="badge badge-warning">
                            Adult Content
                          </div>
                        )}
                        {logData.mediaDescription && (
                          <div className="text-sm mt-2 max-h-28 overflow-y-auto">
                            {logData.mediaDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full bg-base-200 rounded-lg p-8 text-center">
                      {['video', 'audio'].includes(logData.type || '') ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-base-content opacity-40"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            {logData.type === 'video' ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                              />
                            )}
                          </svg>
                          <p className="mt-2 text-base-content opacity-60">
                            {logData.type === 'video' ? 'Video' : 'Audio'}{' '}
                            title: {logData.mediaName || '(enter a title)'}
                          </p>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-base-content opacity-40"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="mt-2 text-base-content opacity-60">
                            {logData.type
                              ? 'Search for media to see a preview'
                              : 'Select a log type to get started'}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {logData.type && (
              <div className="card-actions justify-center mt-6">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isLogCreating || !logData.mediaName}
                >
                  {isLogCreating ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Submitting...
                    </>
                  ) : (
                    'Create Log'
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Move date picker dialog outside the form */}
      <dialog ref={datePickerRef} className="modal modal-middle">
        <div className="modal-box bg-base-100 flex flex-col justify-center">
          <DayPicker
            className="react-day-picker mx-auto"
            mode="single"
            selected={logData.date || undefined}
            onSelect={(date) => {
              handleInputChange('date', date || undefined);
              datePickerRef.current?.close();
            }}
          />
          <div className="modal-action justify-center">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

export default LogScreen;
