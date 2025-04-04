import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase";

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
};

export type User = {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
};

const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged((user: FirebaseUser | null) => {
      if (user) {
        setCurrentUser({
          displayName: user.displayName ?? "",
          email: user.email ?? "",
          photoURL: user.photoURL ?? "",
          uid: user.uid,
        });
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
