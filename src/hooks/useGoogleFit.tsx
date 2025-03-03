import { useEffect, useState } from "react";
import { fetchMonthlySteps, MonthlyStepData } from "../services/googleFitService";
import { useAuth } from "../context/AuthContext";

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
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const dailySteps = await fetchMonthlySteps();
        const totalSteps = dailySteps.reduce((sum, day) => sum + day.steps, 0);

        setState({
          totalSteps,
          dailySteps,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Błąd podczas pobierania danych o krokach:", error);
        setState({
          totalSteps: 0,
          dailySteps: [],
          loading: false,
          error: error instanceof Error ? error.message : "Nieznany błąd",
        });
      }
    };

    loadStepData();
  }, [currentUser]);

  return state;
};
