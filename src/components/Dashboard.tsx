import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useGoogleFit } from "../hooks/useGoogleFit";

const Dashboard: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { totalSteps, dailySteps, loading: stepsLoading, error } = useGoogleFit();
  const navigate = useNavigate();

  // if user is not logged in, redirect him to landing page
  React.useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate("/");
    }
  }, [currentUser, authLoading, navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  if (authLoading) return <div>Ładowanie danych użytkownika...</div>;
  if (!currentUser) return null;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="user-profile">
        {currentUser.photoURL && (
          <img
            src={currentUser.photoURL}
            alt="Avatar użytkownika"
            className="user-avatar"
          />
        )}
        <h2>{currentUser.displayName}</h2>
        <p>{currentUser.email}</p>
      </div>

      <div className="fitness-data">
        <h2>Dane o aktywności w bieżącym miesiącu</h2>

        {stepsLoading && <p>Ładowanie danych o krokach...</p>}

        {error && (
          <div className="error-message">
            <p>Wystąpił problem podczas ładowania danych: {error}</p>
            <p>
              Upewnij się, że masz włączoną usługę Google Fit i udzieliłeś odpowiednich uprawnień.
            </p>
          </div>
        )}

        {!stepsLoading && !error && (
          <>
            <div className="steps-summary">
              <h3>Suma kroków w tym miesiącu: {totalSteps}</h3>
            </div>

            <div className="steps-daily">
              <h3>Kroki dzienne:</h3>
              <table className="steps-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Ilość kroków</th>
                  </tr>
                </thead>
                <tbody>
                  {dailySteps.map((day: any) => (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.steps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <button onClick={handleLogout}>Wyloguj się</button>
    </div>
  );
};

export default Dashboard;
