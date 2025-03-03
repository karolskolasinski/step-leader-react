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

      {topSteps.length > 0 && (
        <div>
          <ol>
            {topSteps.map((top, index) => {
              const currentMonth = `${new Date().getMonth() + 1}`.padStart(2, "0");
              const currentYear = new Date().getFullYear();
              const currentDate = `${currentYear}-${currentMonth}`;

              return (
                <li key={top.id}>
                  {index + 1}. {top.displayName} - {top.stepsData[currentDate]}
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
