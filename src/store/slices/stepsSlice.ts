import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { RootState } from '../store';

interface StepsState {
  monthlySteps: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  lastUpdate: string | null;
}

const initialState: StepsState = {
  monthlySteps: 0,
  status: 'idle',
  error: null,
  lastUpdate: null,
};

// Funkcja do pobierania kroków z Google Fit API
export const fetchStepsFromGoogleFit = createAsyncThunk(
  'steps/fetchFromGoogleFit',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.user.currentUser?.token;
      const userId = state.user.currentUser?.uid;

      if (!token || !userId) {
        return rejectWithValue('Użytkownik nie jest zalogowany lub brak tokenu');
      }

      // Ustawiamy zakres dat na obecny miesiąc
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      // Konwersja na timestamp milisekundy
      const startTime = firstDayOfMonth.getTime();
      const endTime = lastDayOfMonth.getTime();

      // Zapytanie do Google Fit API
      const response = await axios.post(
        'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
        {
          aggregateBy: [{
            dataTypeName: 'com.google.step_count.delta',
            dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
          }],
          bucketByTime: { durationMillis: endTime - startTime },
          startTimeMillis: startTime,
          endTimeMillis: endTime
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Obliczanie sumy kroków z otrzymanych danych
      let totalSteps = 0;
      if (response.data.bucket && response.data.bucket.length > 0) {
        const stepsData = response.data.bucket[0].dataset[0].point;
        if (stepsData && stepsData.length > 0) {
          stepsData.forEach((point: any) => {
            totalSteps += point.value[0].intVal;
          });
        }
      }

      // Zapisujemy dane w Firebase
      const lastUpdate = new Date().toISOString();
      await setDoc(doc(db, 'userSteps', userId), {
        userId,
        monthlySteps: totalSteps,
        year: today.getFullYear(),
        month: today.getMonth() + 1, // Miesiące w JS są 0-indeksowane
        lastUpdate: lastUpdate
      }, { merge: true });

      return {
        monthlySteps: totalSteps,
        lastUpdate
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Nie udało się pobrać danych o krokach');
    }
  }
);

const stepsSlice = createSlice({
  name: 'steps',
  initialState,
  reducers: {
    setSteps: (state, action: PayloadAction<number>) => {
      state.monthlySteps = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStepsFromGoogleFit.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStepsFromGoogleFit.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.monthlySteps = action.payload.monthlySteps;
        state.lastUpdate = action.payload.lastUpdate;
        state.error = null;
      })
      .addCase(fetchStepsFromGoogleFit.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setSteps } = stepsSlice.actions;
export default stepsSlice.reducer;
