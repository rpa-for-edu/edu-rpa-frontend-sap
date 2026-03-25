import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface UserState {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  language: string;
  role?: string;
}

const initialState: UserState = {
  id: 0,
  name: '',
  email: '',
  avatarUrl: '',
  language: 'vi',
  role: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.avatarUrl = action.payload.avatarUrl;
      state.language = action.payload.language || 'vi';
      state.role = action.payload.role || '';
    },

    setUserLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    setUserAvatarUrl: (state, action: PayloadAction<string>) => {
      state.avatarUrl = action.payload;
    },

    removeUser: (state) => {
      state = initialState;
    },
  },
});

export const { setUser, removeUser, setUserLanguage, setUserAvatarUrl } = userSlice.actions;

export default userSlice;

