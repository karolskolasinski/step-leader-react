import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTopStepsUsers, signInWithGoogle } from "../firebase";
import { useAuth } from "../context/AuthContext.tsx";
import { DocumentData } from "firebase/firestore";

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
      console.error("sing in with Google error", error);
    }
  };

  const [topSteps, setTopSteps] = useState<DocumentData[]>([]);

  useEffect(() => {
    const loadTopStepData = async () => {
      try {
        const topSteps = await getTopStepsUsers();
        setTopSteps(topSteps);
      } catch (error) {
        console.error("fetching top steps error: ", error);
      }
    };

    loadTopStepData();
  }, [currentUser]);

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

      {topSteps.length > 0 && (
        <div>
          <h2>Top 100</h2>
          <ol>
            {topSteps.map((top, index) => {
              console.log(top);
              return (
                <li key={top.id}>
                  {index + 1}. {top.displayName} - {top.email} - {top.uid}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <button onClick={handleLogin}>
        Zaloguj przez Google
      </button>
    </div>
  );
};

export default LandingPage;
