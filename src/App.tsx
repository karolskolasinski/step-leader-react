import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { setUser } from "./store/slices/userSlice";
import { fetchStepsFromGoogleFit } from "./store/slices/stepsSlice";
import { fetchLeaderboard } from "./store/slices/leaderboardSlice";
import { RootState } from "./store/store";
import { AppDispatch } from "./store/store";

import Header from "./components/Header";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Obserwator stanu autentykacji
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }));

        // Pobieramy dane o krokach po zalogowaniu
        dispatch(fetchStepsFromGoogleFit());

        // Pobieramy tablicę liderów
        dispatch(fetchLeaderboard());
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  // Pobieramy dane o krokach przy każdym wejściu do aplikacji (jeśli użytkownik jest zalogowany)
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchStepsFromGoogleFit());
      dispatch(fetchLeaderboard());
    }
  }, [currentUser, dispatch]);

  return (
    <div className="app">
      <Header />
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
