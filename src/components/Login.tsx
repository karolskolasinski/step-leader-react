import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../store/slices/userSlice";
import { AppDispatch, RootState } from "../store/store";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { currentUser, status, error } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = () => {
    dispatch(signInWithGoogle());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-100 p-6 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-8 text-center">Lider Kroków</h1>
      <p className="mb-8 text-center max-w-md">
        Zaloguj się za pomocą konta Google, aby połączyć się z Google Fit i śledzić swoje kroki.
      </p>

      <button
        onClick={handleGoogleLogin}
        disabled={status === "loading"}
        className="flex items-center justify-center bg-white text-gray-700 px-6 py-3 rounded-md shadow hover:shadow-lg transition-all duration-200 border border-gray-300"
      >
        {status === "loading" ? <span>Logowanie...</span> : (
          <>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google"
              className="w-6 h-6 mr-3"
            />
            <span>Zaloguj się przez Google</span>
          </>
        )}
      </button>

      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default Login;
