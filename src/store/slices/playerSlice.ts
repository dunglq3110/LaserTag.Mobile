import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlayerData } from '../../services/host/hostTypes';

interface PlayerState extends PlayerData {
  Name: string;
  MacGun: string;
  MacVest: string;
  isConnected: boolean;
}

const initialState: PlayerState = {
  Name: '',
  MacGun: '',
  MacVest: '',
  isConnected: false
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    updatePlayerInfo: (state, action: PayloadAction<PlayerData>) => {
      state.Name = action.payload.Name;
      state.MacGun = action.payload.MacGun;
      state.MacVest = action.payload.MacVest;
    },
    updatePlayerName: (state, action: PayloadAction<string>) => {
      state.Name = action.payload;
    },
    updateMacGun: (state, action: PayloadAction<string>) => {
      state.MacGun = action.payload;
    },
    updateMacVest: (state, action: PayloadAction<string>) => {
      state.MacVest = action.payload;
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    }
  }
});

export const { updatePlayerInfo, updatePlayerName, updateMacGun, updateMacVest, setConnectionStatus } = playerSlice.actions;
export default playerSlice.reducer;

// src/store/store.ts
