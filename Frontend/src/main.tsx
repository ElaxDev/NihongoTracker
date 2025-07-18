import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'react-image-crop/dist/ReactCrop.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import App from './App.tsx';
import HomeScreen from './screens/HomeScreen.tsx';
import LoginScreen from './screens/LoginScreen.tsx';
import RegisterScreen from './screens/RegisterScreen.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './queryClient.ts';
import ProfileScreen from './screens/ProfileScreen.tsx';
import NotFound from './screens/NotFound.tsx';
import StatsScreen from './screens/StatsScreen.tsx';
import ProfileHeader from './components/ProfileHeader.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import ProtectedRoutes from './contexts/protectedRoute.tsx';
import LogScreen from './screens/LogScreen.tsx';
import RankingScreen from './screens/RankingScreen.tsx';
import ListScreen from './screens/ListScreen.tsx';
import MatchMedia from './screens/MatchMedia.tsx';
import MediaDetails from './screens/MediaDetails.tsx';
import MediaHeader from './components/MediaHeader.tsx';
import FeaturesScreen from './screens/FeaturesScreen.tsx';
import SharedLogScreen from './screens/SharedLogScreen.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index={true} path="/" element={<HomeScreen />} />
      <Route path="login" element={<LoginScreen />} />
      <Route path="register" element={<RegisterScreen />} />
      <Route path="settings" element={<SettingsScreen />} />
      <Route path="ranking" element={<RankingScreen />} />
      <Route path="features" element={<FeaturesScreen />} />
      <Route path="/shared-log/:logId" element={<SharedLogScreen />} />
      <Route path="user/:username" element={<ProfileHeader />}>
        <Route index element={<ProfileScreen />} />
        <Route path="stats" element={<StatsScreen />} />
        <Route path="list" element={<ListScreen />} />
      </Route>
      <Route element={<ProtectedRoutes />}>
        <Route index path="createlog" element={<LogScreen />} />
        <Route path="matchmedia" element={<MatchMedia />} />
      </Route>
      <Route path=":mediaType/:mediaId/:username?" element={<MediaHeader />}>
        <Route index element={<MediaDetails />} />
      </Route>
      <Route path="404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
