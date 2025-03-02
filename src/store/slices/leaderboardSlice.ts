import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface LeaderboardUser {
  userId: string;
  displayName: string;
  photoURL: string;
  monthlySteps: number;
}

interface LeaderboardState {
  users: LeaderboardUser[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LeaderboardState = {
  users: [],
  status: 'idle',
  error: null,
};

export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      // Pobieramy bieżący miesiąc i rok
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // Miesiące w JS są 0-indeksowane
      const currentYear = today.getFullYear();

      // Tworzymy zapytanie do bazy danych
      const stepsQuery = query(
        collection(db, 'userSteps'),
        orderBy('monthlySteps', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(stepsQuery);

      // Przetwarzamy wyniki zapytania
      const leaderboardData: LeaderboardUser[] = [];

      for (const docSnapshot of querySnapshot.docs) {
        const stepData = docSnapshot.data();

        // Sprawdzamy czy dane są z bieżącego miesiąca i roku
        if (stepData.month === currentMonth && stepData.year === currentYear) {
          // Pobieramy dodatkowe dane użytkownika
          try {
            const userDoc = await getDocs(query(collection(db, 'users')));
            const userDocs = userDoc.docs.filter(doc => doc.id === stepData.userId);

            if (userDocs.length > 0) {
              const userData = userDocs[0].data();

              leaderboardData.push({
                userId: stepData.userId,
                displayName: userData.displayName || 'Anonim',
                photoURL: userData.photoURL || '',
                monthlySteps: stepData.monthlySteps
              });
            }
          } catch (error) {
            console.error(`Error fetching user data for ${stepData.userId}:`, error);
          }
        }
      }

      return leaderboardData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Nie udało się pobrać danych tabeli liderów');
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default leaderboardSlice.reducer;
