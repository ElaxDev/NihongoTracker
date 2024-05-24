import { create } from 'zustand';
import { IUser } from '../types';

type profileDataState = {
  user: IUser | null;
  setProfile: (user: IUser) => void;
  logout: () => void;
};

export const useProfileDataStore = create<profileDataState>((set) => ({
  user: null,
  setProfile: (user: IUser) => set({ user: user }),
  logout: () => set({ user: null }),
}));
