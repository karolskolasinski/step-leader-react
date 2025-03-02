import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { auth } from "../../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

interface UserState {
  currentUser: any | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastLogin: string | null;
}

const initialState: UserState = {
  currentUser: null,
  status: "idle",
  error: null,
  lastLogin: null,
};

export const signInWithGoogle = createAsyncThunk(
  "user/signInWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/fitness.activity.read");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      // Aktualizujemy dane użytkownika w Firebase
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const lastLogin = new Date().toISOString();

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
        ...(userSnap.exists() ? {} : { registeredAt: serverTimestamp() }),
      }, { merge: true });

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        token,
        lastLogin,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const signOut = createAsyncThunk(
  "user/signOut",
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
        state.lastLogin = action.payload.lastLogin;
        state.error = null;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.currentUser = null;
        state.lastLogin = null;
      });
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
