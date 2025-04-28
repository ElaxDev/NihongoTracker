import { useState } from 'react';
import { updateUserFn, importLogsFn, clearUserDataFn } from '../api/trackerApi';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { ILoginResponse } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserDataStore } from '../store/userData';
import Loader from '../components/Loader';
import ThemeSwitcher from '../components/ThemeSwitcher';

function SettingsScreen() {
  const { setUser, user } = useUserDataStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setPasswordConfirm] = useState('');
  const [discordId, setDiscordId] = useState(user?.discordId || '');
  const [forcedImport] = useState(false);

  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: updateUserFn,
    onSuccess: (data: ILoginResponse) => {
      toast.success('User updated');
      setUser(data);
    },
    onError: (error) => {
      console.log(error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error(error.message ? error.message : 'An error occurred');
      }
    },
  });

  const queryClient = useQueryClient();

  const { mutate: syncLogs, isPending: isSyncPending } = useMutation({
    mutationFn: importLogsFn,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        predicate: (query) => {
          return ['logs', 'user'].includes(query.queryKey[0] as string);
        },
      });
    },
    onError: (error) => {
      console.log(error);
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
      queryClient.invalidateQueries({
        predicate: (query) => {
          return ['logs', 'user'].includes(query.queryKey[0] as string);
        },
      });
    },
    onError: (error) => {
      console.log(error);
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

  async function handleClearData(e: React.FormEvent) {
    e.preventDefault();
    (document.getElementById('my_modal_2') as HTMLDialogElement).close();
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
    <div className="pt-32 py-16 flex justify-center items-center bg-base-200 min-h-screen">
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Are you sure?</h3>
          <p className="py-4">This will delete all your logs and stats!</p>
          <div className="flex gap-2">
            <button
              onClick={handleClearData}
              className="btn btn-outline btn-error"
            >
              Yes, I'm sure!
            </button>
            <form method="dialog" className="btn">
              <button>Cancel</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="card w-96 bg-base-100">
        <div className="card-body">
          <h1 className="font-bold text-xl">Settings</h1>
          <ThemeSwitcher />
          <form onSubmit={handleUpdateUser}>
            <div>
              <label className="label">
                <span className="label-text">Avatar</span>
              </label>
              <input
                type="file"
                id="avatar"
                className="file-input w-full max-w-xs"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Banner</span>
              </label>
              <input
                type="file"
                id="banner"
                className="file-input w-full max-w-xs"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Discord ID</span>
              </label>
              <div className="flex justify-between gap-2 grow">
                <label className="input input-bordered flex grow items-center gap-2">
                  <input
                    type="text"
                    placeholder="Discord ID"
                    value={discordId}
                    onChange={(e) => setDiscordId(e.target.value)}
                  />
                </label>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSyncLogs}
                >
                  {isSyncPending ? (
                    <span className="loading loading-spinner text-primary-content" />
                  ) : (
                    'Sync logs'
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="label">
                <span className="label-text">New password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="label">
                <span className="label-text">Confirm the new password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Password"
                  value={newPasswordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </label>
            </div>
            <div className="flex justify-center mt-6 gap-3">
              <button
                className="btn btn-outline btn-error"
                onClick={() =>
                  (
                    document.getElementById('my_modal_2') as HTMLDialogElement
                  ).showModal()
                }
                type="button"
              >
                Clear User Data
              </button>
              <button className="btn btn-primary" type="submit">
                Update
              </button>
            </div>
          </form>
          {isPending && <Loader />}
          {isClearDataPending && <Loader text={'Clearing user data...'} />}
        </div>
      </div>
    </div>
  );
}

export default SettingsScreen;
