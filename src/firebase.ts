import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/fitness.activity.read");

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (credential) {
      localStorage.setItem("googleFitToken", credential.accessToken ?? "");
    }

    if (result.user) {
      const loginDate = new Date().toISOString();
      await saveLoginDate(result.user.uid, loginDate);
    }

    return result.user;
  } catch (error) {
    console.error("sign in with google error:", error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("googleFitToken");
  return signOut(auth);
};

export const saveLoginDate = async (userId: string, dateStr: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const loginDates = userData.loginDates || [];
      const todayDate = dateStr.split("T")[0];
      const dateExists = loginDates.some((date: string) => date.split("T")[0] === todayDate);

      if (dateExists) {
        const updatedDates = loginDates.map((date: string) => {
          if (date.split("T")[0] === todayDate) {
            return dateStr;
          }
          return date;
        });

        await updateDoc(userRef, {
          loginDates: updatedDates,
        });
      } else {
        await updateDoc(userRef, {
          loginDates: arrayUnion(dateStr),
        });
      }
    } else {
      await setDoc(userRef, {
        loginDates: [dateStr],
      });
    }
  } catch (error) {
    console.error("save login date error: ", error);
    throw error;
  }
};

export const saveStepsData = async (
  userId: string,
  displayName: string | null,
  monthlySteps: number,
) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthYearKey = `${currentYear}-${currentMonth.toString().padStart(2, "0")}`;

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        displayName: displayName,
        [`stepsData.${monthYearKey}`]: monthlySteps,
        lastUpdated: Timestamp.now(),
      });
    } else {
      await setDoc(userRef, {
        displayName: displayName,
        stepsData: {
          [monthYearKey]: monthlySteps,
        },
        loginDates: [new Date().toISOString()],
        lastUpdated: Timestamp.now(),
      });
    }

    return true;
  } catch (error) {
    console.error("saving steps error: ", error);
    throw error;
  }
};

export async function getTopStepsUsers() {
  const currentDate = new Date();
  const fullYear = currentDate.getFullYear();
  const fullMonth = currentDate.getMonth() + 1;
  const month = String(fullMonth).padStart(2, "0");
  const currentMonth = `${fullYear}-${month}`;

  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      orderBy(`stepsData.${currentMonth}`, "desc"),
      limit(100),
    );
    const querySnapshot = await getDocs(q);

    const data: Array<{ id: string } & DocumentData> = [];
    querySnapshot.forEach((doc) =>
      data.push({
        id: doc.id,
        ...doc.data(),
      })
    );

    return data;
  } catch (error) {
    console.error("get top steps error", error);
    throw error;
  }
}

export { auth, db };
