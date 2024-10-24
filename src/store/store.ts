import { configureStore } from '@reduxjs/toolkit';
import playerReducer from './slices/playerSlice';
import upgradesReducer from './slices/upgradesSlice';

export const store = configureStore({
  reducer: {
    player: playerReducer,
    upgrades: upgradesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;