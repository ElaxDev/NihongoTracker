import { useRef, useState } from 'react';
import { ICreateLog, ILog } from '../types';
import { createLogFn } from '../api/trackerApi';
import useSearch from '../hooks/useSearch';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import React from 'react';

function QuickLog() {
  const [logType, setLogType] = useState<ILog['type'] | null>(null);
  const [logDescription, setLogDescription] = useState<string>('');
  const [episodes, setEpisodes] = useState<number>(0);
  const [time, setTime] = useState<number | undefined>(0);
  const [chars, setChars] = useState<number>(0);
  const [pages, setPages] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [contentId, setcontentId] = useState<string | undefined>(undefined);
  const [showTime, setShowTime] = useState<boolean>(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const {
    data: searchResult,
    // error: searchError,
    isLoading: isSearching,
  } = useSearch(logType ?? '', logDescription);

  const { mutate } = useMutation({
    mutationFn: createLogFn,
    onSuccess: () => {
      setLogType(null);
      setLogDescription('');
      setEpisodes(0);
      setTime(0);
      setChars(0);
      setPages(0);
      toast.success('Log created successfully!');
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(error.message ? error.message : 'An error occurred');
      }
    },
  });

  function preventNegativeValues(e: React.ChangeEvent<HTMLInputElement>) {
    if ((e.target as HTMLInputElement).valueAsNumber < 0) {
      (e.target as HTMLInputElement).value = '0';
    }
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    setLogDescription(e.target.value);
    console.log(searchResult);
  }

  async function logSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hours || minutes) {
      await setTime(hours * 60 + minutes);
    } else {
      await setTime(undefined);
    }
    mutate({
      type: logType,
      description: logDescription,
      episodes,
      time: time,
      contentId,
      chars,
      pages,
      date: new Date().toDateString(),
      private: false,
      isAdult: false,
    } as ICreateLog);
  }

  function handleDescriptionInputBlur() {
    setTimeout(() => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(document.activeElement)
      ) {
        setIsSuggestionsOpen(false);
      }
    }, 10);
  }

  function setSelectedSuggestion(title: string, contentId: string) {
    setLogDescription(title);
    setcontentId(contentId);
  }

  function handleSuggestionClick(
    title: string,
    contentId: string
  ): React.MouseEventHandler<HTMLLIElement> | undefined {
    return (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      event.stopPropagation();
      setSelectedSuggestion(title, contentId);
      setIsSuggestionsOpen(false);
    };
  }

  return (
    <>
      <div className="dropdown">
        <div
          tabIndex={0}
          role="button"
          className="btn m-1 w-24 btn-neutral text-neutral-content"
        >
          Quick log
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content z-1 menu p-2 shadow-sm bg-base-100 text-base-content rounded-box w-auto min-w-64"
        >
          <form onSubmit={logSubmit}>
            <label className="form-control w-full max-w-xs">
              <div className="flex flex-col gap-4 mx-3 my-2 items-center">
                <div className="w-full">
                  <div className="label">
                    <span className="label-text">Select the log type</span>
                  </div>
                  <select
                    className="select select-bordered w-full max-w-xs"
                    onChange={(e) => setLogType(e.target.value as ILog['type'])}
                    value={logType || 'Log type'}
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
                <div>
                  <div>
                    <div className="label">
                      <span className="label-text">
                        Write a log description
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Log description"
                      className="input input-bordered w-full max-w-xs"
                      onFocus={() => setIsSuggestionsOpen(true)}
                      onBlur={handleDescriptionInputBlur}
                      onChange={handleSearch}
                      value={logDescription}
                      tabIndex={0}
                    />
                    <div
                      ref={suggestionRef}
                      className={`dropdown dropdown-open ${
                        isSuggestionsOpen && searchResult ? 'block' : 'hidden'
                      }`}
                    >
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-200 rounded-box w-full shadow-lg mt-2"
                      >
                        {isSearching ? (
                          <li>
                            <a>Loading...</a>
                          </li>
                        ) : searchResult?.length === 0 ? (
                          <li>
                            <a>No results found</a>
                          </li>
                        ) : null}
                        {searchResult?.map((group, i) => (
                          <li
                            key={i}
                            onClick={handleSuggestionClick(
                              group.title.contentTitleNative,
                              group.contentId
                            )}
                          >
                            <a>{group.title.contentTitleNative}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                {logType === 'anime' ? (
                  <div>
                    <div>
                      <div className="label">
                        <span className="label-text">How many episodes?</span>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      onInput={preventNegativeValues}
                      placeholder="Episodes"
                      className="input input-bordered w-full max-w-xs"
                      onChange={(e) => setEpisodes(Number(e.target.value))}
                      value={episodes}
                    />
                  </div>
                ) : null}
                {logType === 'anime' ? (
                  <div className="form-control w-full px-10">
                    <label className="label cursor-pointer">
                      <span className="label-text">Custom time</span>
                      <input
                        type="checkbox"
                        checked={showTime}
                        onChange={() => setShowTime(!showTime)}
                        className="checkbox"
                      />
                    </label>
                  </div>
                ) : null}
                {logType !== 'anime' || showTime ? (
                  <div className="w-full">
                    <div className="label">
                      <span className="label-text">For how long?</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max="24"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="range"
                    />
                    <div className="label">
                      <span className="label-text-alt">{`${hours} hours`}</span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(Number(e.target.value))}
                      className="range"
                    />
                    <div className="label">
                      <span className="label-text-alt">{`${minutes} minutes`}</span>
                    </div>
                  </div>
                ) : null}
                <div>
                  <div className="label">
                    <span className="label-text">How many chars?</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    onInput={preventNegativeValues}
                    placeholder="Chars count"
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setChars(Number(e.target.value))}
                    value={chars}
                  />
                </div>
                {logType === 'manga' ? (
                  <div>
                    <div>
                      <div className="label">
                        <span className="label-text">How many pages?</span>
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      onInput={preventNegativeValues}
                      placeholder="Pages"
                      className="input input-bordered w-full max-w-xs"
                      onChange={(e) => setPages(Number(e.target.value))}
                      value={pages}
                    />
                  </div>
                ) : null}
                <button
                  className="btn btn-neutral text-neutral-content w-24 mt-2"
                  type="submit"
                >
                  Create
                </button>
              </div>
            </label>
          </form>
        </ul>
      </div>
    </>
  );
}

export default QuickLog;
