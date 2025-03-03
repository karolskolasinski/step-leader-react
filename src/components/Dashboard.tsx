import { useNavigate } from "react-router-dom";
import { logoutUser } from "../firebase";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";

const Dashboard = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/");
    }
  }, [currentUser, loading, navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        {currentUser.photoURL && <img src={currentUser.photoURL} alt="Avatar użytkownika" />}
        <h2>{currentUser.displayName}</h2>
        <p>{currentUser.email}</p>
      </div>
      <button onClick={handleLogout}>Wyloguj się</button>
    </div>
  );
};

export default Dashboard;
