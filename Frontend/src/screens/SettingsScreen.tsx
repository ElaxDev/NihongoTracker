import React, { useState } from 'react';
import {
  clearUserDataFn,
  importFromCSV,
  importLogsFn,
  updateUserFn,
} from '../api/trackerApi';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { ILoginResponse } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserDataStore } from '../store/userData';
import Loader from '../components/Loader';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { MdInfo } from 'react-icons/md';

function SettingsScreen() {
  const { setUser, user } = useUserDataStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setPasswordConfirm] = useState('');
  const [discordId, setDiscordId] = useState(user?.discordId || '');
  const [forcedImport] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: updateUserFn,
    onSuccess: (data: ILoginResponse) => {
      toast.success('User updated');
      setUser(data);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(error.message ? error.message : 'An error occurred');
      }
    },
  });

  const { mutate: syncLogs, isPending: isSyncPending } = useMutation({
    mutationFn: importLogsFn,
    onSuccess: (data) => {
      toast.success(data.message);
      void queryClient.invalidateQueries({
        predicate: (query) => {
          return ['logs', 'user'].includes(query.queryKey[0] as string);
        },
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(error.message ? error.message : 'An error occurred');
      }
    },
  });

  const { mutate: importCSVLogs, isPending: isImportPending } = useMutation({
    mutationFn: importFromCSV,
    onSuccess: (data) => {
      toast.success(data.message);
      void queryClient.invalidateQueries({
        predicate: (query) => {
          return ['logs', 'user'].includes(query.queryKey[0] as string);
        },
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(error.message ? error.message : 'An error occurred');
      }
    },
  });

  const { mutate: clearData, isPending: isClearDataPending } = useMutation({
    mutationFn: clearUserDataFn,
    onSuccess: (data) => {
      toast.success(data.message);
      void queryClient.invalidateQueries({
        predicate: (query) => {
          return ['logs', 'user'].includes(query.queryKey[0] as string);
        },
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(error.message ? error.message : 'An error occurred');
      }
    },
  });

  async function handleSyncLogs(e: React.FormEvent) {
    e.preventDefault();
    syncLogs(forcedImport);
  }

  async function handleImportCSV(e: React.FormEvent) {
    e.preventDefault();
    const csvFile = (document.getElementById('csv') as HTMLInputElement)
      .files![0];
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }
    const formData = new FormData();
    formData.append('csv', csvFile);
    importCSVLogs(formData);
  }

  async function handleClearData(e: React.FormEvent) {
    e.preventDefault();
    (document.getElementById('clear_data_modal') as HTMLDialogElement).close();
    clearData();
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('newPassword', newPassword);
    formData.append('discordId', discordId);
    formData.append('newPasswordConfirm', newPasswordConfirm);

    const avatar = (document.getElementById('avatar') as HTMLInputElement)
      .files![0];
    const banner = (document.getElementById('banner') as HTMLInputElement)
      .files![0];

    if (avatar) {
      formData.append('avatar', avatar);
    }
    if (banner) {
      formData.append('banner', banner);
    }

    updateUser(formData);
  }

  return (
    <div className="pt-20 py-16 bg-base-200 min-h-screen">
      {/* Confirm Clear Data Modal */}
      <dialog
        id="clear_data_modal"
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">
            Confirm Data Deletion
          </h3>
          <div className="divider"></div>
          <p className="py-4">
            This will permanently delete all your logs and statistics. This
            action cannot be undone.
          </p>
          <div className="modal-action">
            <button onClick={handleClearData} className="btn btn-error">
              Delete All Data
            </button>
            <form method="dialog">
              <button className="btn btn-outline">Cancel</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl font-bold mb-6">Settings</h1>

            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium">Theme</span>
              <ThemeSwitcher />
            </div>

            <form onSubmit={handleUpdateUser}>
              <fieldset className="fieldset mb-6">
                <legend className="fieldset-legend">Profile</legend>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Avatar</span>
                    </label>
                    <input
                      type="file"
                      id="avatar"
                      className="file-input file-input-bordered w-full"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Banner</span>
                    </label>
                    <input
                      type="file"
                      id="banner"
                      className="file-input file-input-bordered w-full"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label">
                    <span className="label-text">Discord ID</span>
                    <span className="label-text-alt text-info">
                      (Only for Manabe Discord Members)
                    </span>
                  </label>
                  <div className="join w-full">
                    <input
                      type="text"
                      placeholder="Discord ID"
                      value={discordId}
                      onChange={(e) => setDiscordId(e.target.value)}
                      className="input input-bordered w-full join-item"
                    />
                    <button
                      className="btn btn-primary join-item"
                      type="button"
                      onClick={handleSyncLogs}
                      disabled={!discordId || isSyncPending}
                    >
                      {isSyncPending ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        'Sync Logs'
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label">
                    <span className="label-text">Import from CSV</span>
                    <span
                      className="tooltip"
                      data-tip='The headers of the CSV File should be "type ("anime", "manga", "reading", "vn", "video", "audio" or "other"), description, date, quantity (this column varies according to the type column, for anime is episodes, manga is pages, reading is characters, vn is characters, video is time, audio is time, other is time), time (in minutes), chars, mediaId (if applicable)" if they are not, the import can and will fail.'
                    >
                      <MdInfo />
                    </span>
                  </label>
                  <input
                    type="file"
                    id="csv"
                    className="file-input file-input-bordered w-full"
                  />
                  <button
                    className="btn btn-primary mt-2"
                    type="button"
                    onClick={handleImportCSV}
                    disabled={isImportPending}
                  >
                    Import
                  </button>
                </div>
              </fieldset>

              <fieldset className="fieldset mb-6">
                <legend className="fieldset-legend">Account</legend>

                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="new-off"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">Current Password</span>
                    <span className="label-text-alt">
                      (Required to update account)
                    </span>
                  </label>
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">New Password</span>
                      <span className="label-text-alt">(Optional)</span>
                    </label>
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input input-bordered w-full"
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Confirm New Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={newPasswordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
                <button
                  className="btn btn-outline btn-error"
                  onClick={() =>
                    (
                      document.getElementById(
                        'clear_data_modal'
                      ) as HTMLDialogElement
                    ).showModal()
                  }
                  type="button"
                >
                  Clear User Data
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={
                    isPending ||
                    (!username &&
                      !password &&
                      !newPassword &&
                      !newPasswordConfirm &&
                      !discordId)
                  }
                >
                  {isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>

            {isClearDataPending && (
              <div className="fixed inset-0 bg-base-300 bg-opacity-80 flex items-center justify-center z-50">
                <div className="card bg-base-100 shadow-xl p-6">
                  <Loader text={'Clearing user data...'} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsScreen;
