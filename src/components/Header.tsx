import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "../store/slices/userSlice";
import { AppDispatch, RootState } from "../store/store";

const Header = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const handleSignOut = () => {
    dispatch(signOut());
    navigate("/login");
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold">Lider Kroków</Link>
        </div>

        <nav className="flex items-center">
          <Link to="/leaderboard" className="mx-4 hover:underline">
            Tabela Liderów
          </Link>

          {currentUser
            ? (
              <div className="flex items-center">
                <Link to="/dashboard" className="mx-4 hover:underline">
                  Mój Profil
                </Link>

                <div className="flex items-center">
                  {currentUser.photoURL && (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "Avatar"}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  )}
                  <span className="mr-4">{currentUser.displayName}</span>
                </div>

                <button
                  onClick={handleSignOut}
                  className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
                >
                  Wyloguj
                </button>
              </div>
            )
            : (
              <Link
                to="/login"
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition-colors"
              >
                Zaloguj
              </Link>
            )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
