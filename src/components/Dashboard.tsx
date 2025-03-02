import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStepsFromGoogleFit } from '../store/slices/stepsSlice';
import { RootState, AppDispatch } from "../store/store";

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser, lastLogin } = useSelector((state: RootState) => state.user);
  const { monthlySteps, status, lastUpdate, error } = useSelector((state: RootState) => state.steps);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchStepsFromGoogleFit());
    }
  }, [currentUser, dispatch]);

  const handleRefreshSteps = () => {
    dispatch(fetchStepsFromGoogleFit());
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Brak danych';
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL');
  };

  if (!currentUser) {
    return (
      <div className="text-center p-8">
        <p>Musisz być zalogowany, aby zobaczyć swój profil.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        {currentUser.photoURL && (
          <img
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'Avatar'}
            className="w-16 h-16 rounded-full mr-4"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{currentUser.displayName}</h1>
          <p className="text-gray-600">{currentUser.email}</p>
          <p className="text-sm text-gray-500">
            Ostatnie logowanie: {formatDate(lastLogin)}
          </p>
        </div>
      </div>

      <div className="mb-8 bg-blue-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Twoje kroki w tym miesiącu</h2>
          <button
            onClick={handleRefreshSteps}
            disabled={status === 'loading'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {status === 'loading' ? 'Aktualizowanie...' : 'Odśwież dane'}
          </button>
        </div>

        {error ? (
          <div className="text-red-500 p-4 bg-red-50 rounded">
            Błąd: {error}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {monthlySteps.toLocaleString()}
            </div>
            <p className="text-gray-600">kroków</p>
            {lastUpdate && (
              <p className="text-sm text-gray-500 mt-2">
                Ostatnia aktualizacja: {formatDate(lastUpdate)}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Dzienne cele</h3>
        <div className="flex items-center mb-2">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-600 h-4 rounded-full"
              style={{ width: `${Math.min(100, (monthlySteps / 300) / (new Date().getDate()))}%` }}
            ></div>
          </div>
          <span className="ml-4 text-gray-700">
            {Math.round((monthlySteps / 300) / (new Date().getDate()))}%
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Cel: 10 000 kroków dziennie ({(10000 * new Date().getDate()).toLocaleString()} kroków w tym miesiącu)
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
