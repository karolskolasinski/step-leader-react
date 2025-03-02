import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import stepsReducer from './slices/stepsSlice';
import leaderboardReducer from './slices/leaderboardSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    steps: stepsReducer,
    leaderboard: leaderboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
