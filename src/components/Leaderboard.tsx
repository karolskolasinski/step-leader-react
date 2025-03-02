import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaderboard } from "../store/slices/leaderboardSlice";
import { RootState } from "../store/store";
import { AppDispatch } from "../store/store";

const Leaderboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, status, error } = useSelector((state: RootState) => state.leaderboard);
  const { currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  const getCurrentMonth = () => {
    const months = [
      "Styczeń",
      "Luty",
      "Marzec",
      "Kwiecień",
      "Maj",
      "Czerwiec",
      "Lipiec",
      "Sierpień",
      "Wrzesień",
      "Październik",
      "Listopad",
      "Grudzień",
    ];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  const handleRefresh = () => {
    dispatch(fetchLeaderboard());
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tabela Liderów - {getCurrentMonth()}</h1>
        <button
          onClick={handleRefresh}
          disabled={status === "loading"}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {status === "loading" ? "Aktualizowanie..." : "Odśwież"}
        </button>
      </div>

      {error
        ? (
          <div className="text-red-500 p-4 bg-red-50 rounded mb-4">
            Błąd: {error}
          </div>
        )
        : null}

      {status === "loading" && users.length === 0
        ? (
          <div className="text-center p-8">
            <p>Ładowanie danych...</p>
          </div>
        )
        : users.length === 0
        ? (
          <div className="text-center p-8 bg-gray-50 rounded">
            <p>Brak danych dla bieżącego miesiąca.</p>
          </div>
        )
        : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left">Pozycja</th>
                  <th className="px-4 py-3 text-left">Użytkownik</th>
                  <th className="px-4 py-3 text-right">Kroki</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.userId}
                    className={`
                    ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    ${currentUser && user.userId === currentUser.uid ? "bg-blue-50" : ""}
                    border-b
                  `}
                  >
                    <td className="px-4 py-3">
                      {index === 0
                        ? <span className="text-yellow-500 font-bold">🥇 1</span>
                        : index === 1
                        ? <span className="text-gray-400 font-bold">🥈 2</span>
                        : index === 2
                        ? <span className="text-amber-700 font-bold">🥉 3</span>
                        : <span>{index + 1}</span>}
                    </td>
                    <td className="px-4 py-3 flex items-center">
                      {user.photoURL
                        ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        )
                        : <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>}
                      <span
                        className={currentUser && user.userId === currentUser.uid
                          ? "font-bold"
                          : ""}
                      >
                        {user.displayName}
                        {currentUser && user.userId === currentUser.uid ? " (Ty)" : ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {user.monthlySteps.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
};

export default Leaderboard;
