export interface User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

export interface StepData {
  date: string;
  steps: number;
}

export interface MonthlyStepData {
  totalSteps: number;
  dailySteps: StepData[];
  loading: boolean;
  error: string | null;
}

export const fetchMonthlySteps = async (): Promise<StepData[]> => {
  const token = localStorage.getItem('googleFitToken');

  if (!token) {
    throw new Error('Brak tokenu dostępu do Google Fit');
  }

  // Obliczamy datę początku i końca miesiąca
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Konwertujemy daty na timestamp w milisekundach
  const startTimeMillis = startOfMonth.getTime();
  const endTimeMillis = endOfMonth.getTime();

  // Przygotowujemy zapytanie do Google Fitness API
  const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      aggregateBy: [{
        dataTypeName: 'com.google.step_count.delta',
        dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
      }],
      bucketByTime: { durationMillis: 86400000 }, // Grupuj po dniach (86400000 ms = 1 dzień)
      startTimeMillis,
      endTimeMillis
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Błąd pobierania danych: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();

  // Parsujemy odpowiedź, aby uzyskać liczbę kroków z każdego dnia
  const dailySteps: StepData[] = [];

  data.bucket.forEach((bucket: any) => {
    try {
      // Konwertujemy string na liczbę za pomocą parseInt - to rozwiązuje problem
      const startTimeMs = parseInt(bucket.startTimeMillis, 10);

      // Sprawdzamy czy otrzymaliśmy poprawną liczbę
      if (isNaN(startTimeMs)) {
        console.warn('Nieprawidłowy format timestampu:', bucket.startTimeMillis);
        return; // Pomijamy ten wpis
      }

      const bucketDate = new Date(startTimeMs);
      // Sprawdzamy czy data jest poprawna
      if (isNaN(bucketDate.getTime())) {
        console.warn('Nieprawidłowa data utworzona z timestampu:', startTimeMs);
        return; // Pomijamy ten wpis
      }

      // Formatujemy datę ręcznie, zamiast polegać na toISOString()
      const year = bucketDate.getFullYear();
      // getMonth() zwraca wartość od 0-11, więc dodajemy 1
      const month = String(bucketDate.getMonth() + 1).padStart(2, '0');
      const day = String(bucketDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      let steps = 0;

      // Sprawdzamy, czy są dane o krokach
      if (bucket.dataset && bucket.dataset.length > 0) {
        const stepDataSet = bucket.dataset[0];

        if (stepDataSet.point && stepDataSet.point.length > 0) {
          // Sumujemy wszystkie kroki z tego dnia
          stepDataSet.point.forEach((point: any) => {
            if (point.value && point.value.length > 0) {
              steps += point.value[0].intVal || 0;
            }
          });
        }
      }

      dailySteps.push({
        date: dateString,
        steps
      });
    } catch (err) {
      console.error('Błąd podczas przetwarzania danych dla bucket:', err);
      // Logujemy błąd, ale kontynuujemy przetwarzanie pozostałych danych
    }
  });

  // Sortujemy kroki według daty
  dailySteps.sort((a, b) => a.date.localeCompare(b.date));

  return dailySteps;
};
