import { useEffect, useState } from "react";
import { fetchMonthlySteps, StepData } from "../services/googleFitService";
import { useAuth } from "../context/AuthContext";
import { saveStepsData } from "../firebase";

type MonthlyStepData = {
  totalSteps: number;
  dailySteps: StepData[];
  loading: boolean;
  error: string | null;
};

export const useGoogleFit = (): MonthlyStepData => {
  const [state, setState] = useState<MonthlyStepData>({
    totalSteps: 0,
    dailySteps: [],
    loading: true,
    error: null,
  });

  const { currentUser } = useAuth();

  useEffect(() => {
    const loadStepData = async () => {
      if (!currentUser) {
        setState((prev) => ({
          ...prev,
          loading: false,
        }));

        return;
      }

      try {
        const dailySteps = await fetchMonthlySteps();
        const totalSteps = dailySteps.reduce((sum, day) => sum + day.steps, 0);

        if (currentUser.uid) {
          await saveStepsData(
            currentUser.uid,
            currentUser.displayName,
            totalSteps,
          );
        }

        setState({
          totalSteps,
          dailySteps,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("fetching steps error: ", error);
        setState({
          totalSteps: 0,
          dailySteps: [],
          loading: false,
          error: error instanceof Error ? error.message : "error",
        });
      }
    };

    loadStepData();
  }, [currentUser]);

  return state;
};
