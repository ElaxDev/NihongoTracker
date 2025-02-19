import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ILog, IAnimeLog, IVNDocument } from '../types';
import { createLogFn } from '../api/trackerApi';
import { useSearchAnilist } from '../hooks/useSearchAnilist';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchVN } from '../hooks/useSearchVN';

interface anilistSuggestion {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  type: string;
  coverImage: {
    extraLarge: string;
    medium: string;
    large: string;
    color: string;
  };
  siteUrl: string;
}

function LogScreen() {
  const [logType, setLogType] = useState<ILog['type'] | null>(null);
  const [logTitleNative, setLogTitleNative] = useState<string>('');
  const [logTitleRomaji, setLogTitleRomaji] = useState<string | null>('');
  const [logDescription, setLogDescription] = useState<string>('');
  const [LogMediaName, setLogMediaName] = useState<string>('');
  const [logId, setLogId] = useState<string>('');
  const [episodes, setEpisodes] = useState<number>(0);
  const [time, setTime] = useState<number | undefined>(0);
  const [chars, setChars] = useState<number>(0);
  const [pages, setPages] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [showTime, setShowTime] = useState<boolean>(false);
  const [showChars, setShowChars] = useState<boolean>(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [shouldAnilistSearch, setShouldAnilistSearch] = useState<boolean>(true);
  const [shouldVNSearch, setShouldVNSearch] = useState<boolean>(true);
  const [logImg, setLogImg] = useState<string>('');
  const suggestionRef = useRef<HTMLDivElement>(null);
  const anilistPage = 1;
  const anilistPerPage = 10;
  const {
    data: anilistSearchResult,
    error: anilistSearchError,
    isLoading: isSearchingAnilist,
  } = useSearchAnilist(
    shouldAnilistSearch ? LogMediaName : '',
    shouldAnilistSearch
      ? logType == 'anime'
        ? 'ANIME'
        : logType == 'manga'
        ? 'MANGA'
        : logType == 'reading'
        ? 'MANGA'
        : undefined
      : undefined,
    anilistPage,
    anilistPerPage,
    logType == 'reading' ? 'NOVEL' : undefined
  );

  const {
    data: VNSearchResult,
    error: VNSearchError,
    isLoading: isSearchingVN,
  } = useSearchVN(shouldVNSearch ? LogMediaName : '');

  const queryClient = useQueryClient();

  const { mutate: createLog, isPending: isLogCreating } = useMutation({
    mutationFn: createLogFn,
    onSuccess: () => {
      setLogType(null);
      setLogMediaName('');
      setLogDescription('');
      setLogImg('');
      setEpisodes(0);
      setTime(0);
      setChars(0);
      setPages(0);
      setShouldAnilistSearch(false);
      queryClient.invalidateQueries({
        predicate: (query) => {
          return ['logs', 'user'].includes(query.queryKey[0] as string);
        },
      });
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
    setLogMediaName(e.target.value);
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

  async function logSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (hours || minutes) {
      await setTime(hours * 60 + minutes);
    } else {
      await setTime(undefined);
    }

    createLog({
      type: logType,
      contentId: logId,
      description: logDescription,
      mediaName: LogMediaName,
      contentMedia: {
        contentTitleNative: logTitleNative,
        contentTitleRomaji: logTitleRomaji,
        contentImage: logImg,
      },
      episodes,
      time: time,
      chars,
      pages,
    } as IAnimeLog);
  }

  function setSelectedSuggestion(group: anilistSuggestion | IVNDocument) {
    if (logType == 'anime' || logType == 'manga' || logType == 'reading') {
      const suggestion = group as anilistSuggestion;
      setLogTitleNative(suggestion.title.native);
      setLogTitleRomaji(suggestion.title.romaji);
      setLogId(suggestion.id.toString());
      setLogImg(suggestion.coverImage.large);
      setLogMediaName(suggestion.title.romaji);
    } else if (logType == 'vn') {
      const suggestion = group as IVNDocument;
      setLogTitleNative(suggestion.title);
      setLogTitleRomaji(suggestion.latin);
      setLogId(suggestion.id);
      setLogMediaName(suggestion.latin ?? suggestion.title);
      setLogImg(
        `https://t.vndb.org/${suggestion.image.substring(0, 2)}/${
          parseInt(suggestion.image.substring(2)) % 100
        }/${suggestion.image.substring(2)}.jpg`
      );
    }
  }

  function handleSuggestionClick(
    group: anilistSuggestion | IVNDocument
  ): React.MouseEventHandler<HTMLLIElement> | undefined {
    return (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      event.stopPropagation();
      setSelectedSuggestion(group);
      setIsSuggestionsOpen(false);
    };
  }

  useEffect(() => {
    if (anilistSearchError) {
      toast.error(`Error: ${anilistSearchError.message}`);
    }
    if (VNSearchError) {
      toast.error(`Error: ${VNSearchError.message}`);
    }
    if (
      LogMediaName &&
      (logType == 'anime' || logType == 'manga' || logType == 'reading')
    ) {
      setShouldAnilistSearch(true);
    } else if (LogMediaName && logType == 'vn') {
      setShouldVNSearch(true);
    }
  }, [anilistSearchError, LogMediaName, logType, VNSearchError]);

  return (
    <div className="pt-32 py-16 flex justify-center items-center bg-base-300 min-h-screen">
      <div className="card min-w-96 bg-base-100">
        <div className="card-body flex-row gap-12">
          <div className="w-80">
            <h1 className="font-bold text-xl">Log</h1>
            <form onSubmit={logSubmit}>
              <div>
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
              </div>
              {logType ? (
                <>
                  <div>
                    <div className="label">
                      <span className="label-text">
                        Write the name of the media
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Media name"
                      className="input input-bordered w-full max-w-xs peer"
                      onFocus={() => setIsSuggestionsOpen(true)}
                      onBlur={handleDescriptionInputBlur}
                      onChange={handleSearch}
                      value={LogMediaName}
                      tabIndex={0}
                    />
                    <div
                      ref={suggestionRef}
                      className={`dropdown dropdown-open ${
                        isSuggestionsOpen &&
                        (anilistSearchResult || VNSearchResult)
                          ? 'block'
                          : 'hidden'
                      }`}
                    >
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-200 rounded-box w-full shadow-lg mt-2"
                      >
                        {isSearchingAnilist || isSearchingVN ? (
                          <li>
                            <a>Loading...</a>
                          </li>
                        ) : anilistSearchResult?.Page?.media.length === 0 ||
                          VNSearchResult?.length === 0 ? (
                          <li>
                            <a>No results found</a>
                          </li>
                        ) : null}
                        {anilistSearchResult?.Page?.media.map((group, i) => (
                          <li key={i} onClick={handleSuggestionClick(group)}>
                            <a>{group.title.romaji}</a>
                          </li>
                        ))}
                        {VNSearchResult?.map((group, i) => (
                          <li key={i} onClick={handleSuggestionClick(group)}>
                            <a>{group.title}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="label">
                      <span className="label-text">
                        Any additional information?
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="Description"
                      className="input input-bordered w-full max-w-xs peer"
                      onChange={(e) => setLogDescription(e.target.value)}
                      value={logDescription}
                      tabIndex={0}
                    />
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
                  {logType === 'anime' ? (
                    <div className="form-control w-full px-10">
                      <label className="label cursor-pointer">
                        <span className="label-text">Character count</span>
                        <input
                          type="checkbox"
                          checked={showChars}
                          onChange={() => setShowChars(!showChars)}
                          className="checkbox"
                        />
                      </label>
                    </div>
                  ) : null}
                  {logType !== 'anime' || showChars ? (
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
                  ) : null}
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
                  <div className="flex flex-col items-center">
                    <button
                      className="btn btn-neutral text-neutral-content w-24 mt-2"
                      type="submit"
                    >
                      {isLogCreating ? 'Loading...' : 'Submit'}
                    </button>
                  </div>
                </>
              ) : null}
            </form>
          </div>
          {logImg ? (
            <div className="p-3 gap-2 flex flex-col items-center">
              <figure>
                <img src={logImg} />
              </figure>
              <p className="font-bold text-lg">{logTitleRomaji}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default LogScreen;
