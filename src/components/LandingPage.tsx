import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebase";
import { useAuth } from "../context/AuthContext.tsx";

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      console.error("Nie udało się zalogować", error);
    }
  };

  return (
    <div>
      <h1>Lider kroków</h1>

      <table>
        <thead>
          <tr>
            <th>Funkcja</th>
            <th>Opis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Autentykacja</td>
            <td>Zaloguj się przez Google</td>
          </tr>
          <tr>
            <td>Dashboard</td>
            <td>Zobacz swoje dane po zalogowaniu</td>
          </tr>
        </tbody>
      </table>

      <button onClick={handleLogin}>
        Zaloguj przez Google
      </button>
    </div>
  );
};

export default LandingPage;
