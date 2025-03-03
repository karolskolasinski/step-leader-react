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

  /* count last streak day by day, if there is a gap - stop counting */
  function countStreakDays(loginDates: string[]): number {
    if (loginDates.length === 0) {
      return 0;
    }

    const sortedDates = loginDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let count = 1;
    let lastDate = new Date(sortedDates[0]);

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const lastDateTime = lastDate.getTime();
      const currentDateTime = currentDate.getTime();
      const diffDays = Math.floor((lastDateTime - currentDateTime) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        count++;
        lastDate = currentDate;
      } else {
        break;
      }
    }

    return count;
  }

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
              const streakDays = countStreakDays(top.loginDates);

              return (
                <li key={top.id}>
                  {index + 1}. {top.displayName} - {top.stepsData[currentDate]} - {streakDays}
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
