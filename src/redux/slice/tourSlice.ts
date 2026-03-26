import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TourState {
  run: boolean;
  stepIndex: number;
}

const initialState: TourState = {
  run: false,
  stepIndex: 0,
};

const tourSlice = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    startTour(state) {
      state.run = true;
      state.stepIndex = 0;
    },
    stopTour(state) {
      state.run = false;
      state.stepIndex = 0;
    },
    setStepIndex(state, action: PayloadAction<number>) {
      state.stepIndex = action.payload;
    },
    setRun(state, action: PayloadAction<boolean>) {
      state.run = action.payload;
    }
  },
});

export const { startTour, stopTour, setStepIndex, setRun } = tourSlice.actions;
export default tourSlice;
