import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTopStepsUsers, signInWithGoogle } from "../firebase";
import { useAuth } from "../context/AuthContext.tsx";
import { DocumentData } from "firebase/firestore";
import hero from "../assets/hero1.png";
import logo from "../assets/logo.png";
import v3 from "../assets/v3.png";

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

    const sortedDates = loginDates
      .map((date) => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime());

    let count = 1;
    let lastDate = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];

      const lastDateOnly = new Date(
        lastDate.getFullYear(),
        lastDate.getMonth(),
        lastDate.getDate(),
      );
      const currentDateOnly = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      );

      const diffDays = Math.floor(
        (lastDateOnly.getTime() - currentDateOnly.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        count++;
        lastDate = currentDate;
      } else {
        break;
      }
    }

    return count;
  }

  const currentMonth = `${new Date().getMonth() + 1}`.padStart(2, "0");
  const currentMonthName = new Date().toLocaleString("pl-PL", { month: "long" });
  const currentYear = new Date().getFullYear();
  const currentDate = `${currentYear}-${currentMonth}`;
  const currentMonthSteps = topSteps.map((t) => t.stepsData[currentDate]);
  const maxSteps = Math.max(...currentMonthSteps);

  return (
    <div className="antialiased">
      <div className="w-full text-gray-700 bg-orange-100">
        <div className="flex flex-col max-w-screen-xl px-8 mx-auto md:items-center md:justify-between md:flex-row">
          <div className="flex flex-row items-center justify-between md:-my-12">
            <div className="relative md:mt-8">
              <div className="relative z-50 font-bold tracking-widest text-gray-900 rounded-lg focus:outline-none focus:shadow-outline">
                <img src={logo} alt="logo" className="h-32 md:min-w-44 md:w-44 md:h-44" />
              </div>
            </div>
          </div>
          <nav className="hidden flex-col flex-grow md:items-center pb-4 md:pb-0 md:flex md:justify-end md:flex-row items-center">
            <a
              className="px-4 py-2 mt-2 text-sm bg-transparent rounded-lg md:ml-4 hover:text-gray-900 focus:outline-none focus:shadow-outline"
              href="/"
            >
              Home
            </a>

            <a
              className="px-4 py-2 mt-2 text-sm bg-transparent rounded-lg md:ml-4 hover:text-gray-900 focus:outline-none focus:shadow-outline"
              href="#list"
            >
              Lista
            </a>

            <a
              className="px-4 py-2 mt-2 text-sm bg-transparent rounded-lg md:ml-4 hover:text-gray-900 focus:outline-none focus:shadow-outline"
              href="#about"
            >
              O Twórcy
            </a>

            <a
              className="px-10 py-3 mt-2 text-sm text-center bg-white text-gray-800 rounded-full md:ml-4"
              href="#"
              onClick={handleLogin}
            >
              Zaloguj
            </a>
          </nav>
        </div>
      </div>

      <div className="bg-orange-100">
        <div className="max-w-screen-xl px-8 mx-auto flex flex-col lg:flex-row items-start pt-4">
          <div className="flex flex-col w-full lg:w-6/12 justify-center lg:pt-20 items-start text-center lg:text-left mb-5 md:mb-0">
            <h1 className="my-4 text-5xl font-bold leading-tight text-darken">
              <span className="text-yellow-500">Dołącz</span> online do rywalizacji
            </h1>
            <p className="leading-normal text-2xl">
              Step Leader to ekscytująca platforma, na której rywalizujesz online w liczbie kroków
              miesięcznie!
            </p>
            <div className="w-full flex flex-col sm:flex-row pt-4 items-center justify-center lg:justify-start md:space-x-5 sm:gap-4 sm:p-0">
              <button
                onClick={handleLogin}
                className="lg:mx-0 bg-yellow-500 text-white text-xl font-bold rounded-full py-4 px-9 focus:outline-none transform transition hover:scale-110 duration-300 ease-in-out cursor-pointer"
              >
                Dołącz do zabawy
              </button>

              <div className="w-32">
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original-wordmark.svg"
                  alt="google"
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-6/12 lg:-mt-10" id="girl">
            <img
              className="w-10/12 mx-auto 2xl:-mb-20"
              src={hero}
              alt="hero"
            />
          </div>
        </div>
      </div>

      <div className="container px-4 lg:px-8 mx-auto max-w-screen-xl text-gray-700 overflow-x-hidden">
        <div className="mx-auto text-center mt-24">
          <h1 className="font-bold text-black my-3 text-2xl pb-12">
            Lista <span className="text-yellow-500" id="list">100 najlepszych</span>{" "}
            <span className="text-black">({currentMonthName} {new Date().getFullYear()})</span>
          </h1>

          {topSteps.length > 0 && (
            <>
              {topSteps.map((top) => {
                const streakDays = countStreakDays(top.loginDates);
                const topSteps = top.stepsData[currentDate];
                const topWidth = (topSteps / maxSteps) * 100;
                const topWidthPercent = `${topWidth}%`;

                return (
                  <div
                    key={top.id}
                    style={{ width: topWidthPercent }}
                    className="border border-gray-300 p-2 rounded-xl flex gap-2 items-center text-2xl font-black justify-between mb-4 relative"
                  >
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,transparent_25%,rgba(243,244,246,0.5)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-background-shine" />

                    <div className="flex gap-2">
                      <div className="border-r border-gray-300 pr-2 whitespace-nowrap">
                        {top.displayName}
                      </div>
                      <div className="whitespace-nowrap" title="Dobra passa">
                        {streakDays}🔥
                      </div>
                    </div>

                    <div>{topSteps}</div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <hr className="my-40 text-gray-200" />

        <div className="grid md:grid-cols-2 gap-14 md:gap-5 my-44" id="about">
          <div className="bg-white shadow-xl p-6 text-center rounded-xl">
            <h1 className="font-black text-2xl mb-3 text-darken">
              Twórca
            </h1>

            <div className="flex flex-col items-center sm:flex-row gap-8 pt-4">
              <div className="w-36">
                <img src={v3} alt="creator" className="rounded-full" />
              </div>

              <div className="flex flex-col gap-4">
                <strong className="text-gray-600 text-left">
                  Karol Skolasiński
                </strong>

                <div className="flex gap-2 items-center">
                  <a href="https://www.linkedin.com/in/karolskolasinski/">
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linkedin/linkedin-original.svg"
                      alt="linkedin"
                      className="min-w-12 hover:opacity-80"
                    />
                  </a>

                  <div className="flex flex-col">
                    <div className=" text-left text-black text-xl font-black">linkedin</div>
                    <div className="text-sm text-gray-500">/karolskolasinski</div>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <a href="https://github.com/karolskolasinski/">
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
                      alt="github"
                      className="min-w-12 hover:opacity-80"
                    />
                  </a>

                  <div className="flex flex-col">
                    <div className=" text-left text-black text-xl font-black">github</div>
                    <div className="text-sm text-gray-500">/karolskolasinski</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-xl p-6 text-center rounded-xl">
            <h1 className="font-black text-2xl mb-3 text-darken">
              Technologie
            </h1>

            <div className="pt-4 flex flex-col sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
              <div className="flex gap-2 items-center">
                <a href="#">
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"
                    alt="react"
                    className="min-w-12 hover:opacity-80"
                  />
                </a>

                <div className="flex flex-col text-left">
                  <div className=" text-black text-xl font-black">React</div>
                  <div className="text-sm text-gray-500">19.0.0</div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <a href="#">
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg"
                    alt="vite"
                    className="min-w-12 hover:opacity-80"
                  />
                </a>

                <div className="flex flex-col text-left">
                  <div className=" text-black text-xl font-black">Vite</div>
                  <div className="text-sm text-gray-500">6.2.0</div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <a href="#">
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg"
                    alt="typescript"
                    className="min-w-12 hover:opacity-80"
                  />
                </a>

                <div className="flex flex-col text-left">
                  <div className=" text-black text-xl font-black">Typescript</div>
                  <div className="text-sm text-gray-500">5.7.2</div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <a href="#">
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/eslint/eslint-original.svg"
                    alt="eslint"
                    className="min-w-12 hover:opacity-80"
                  />
                </a>

                <div className="flex flex-col text-left">
                  <div className=" text-black text-xl font-black">eslint</div>
                  <div className="text-sm text-gray-500">9.21.0</div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <a href="#">
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
                    alt="tailwind"
                    className="min-w-12 hover:opacity-80"
                  />
                </a>

                <div className="flex flex-col text-left">
                  <div className=" text-black text-xl font-black">Tailwind</div>
                  <div className="text-sm text-gray-500">4.0.9</div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <a href="#">
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg"
                    alt="firebase"
                    className="min-w-12 hover:opacity-80"
                  />
                </a>

                <div className="flex flex-col text-left">
                  <div className=" text-black text-xl font-black">Firebase</div>
                  <div className="text-sm text-gray-500">11.4.0</div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <a href="#">
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg"
                    alt="google"
                    className="min-w-12 hover:opacity-80"
                  />
                </a>

                <div className="flex flex-col text-left">
                  <div className=" text-black text-xl font-black">Google</div>
                  <div className="text-sm text-gray-500">Cloud API</div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <a href="#">
                  <img
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/netlify/netlify-original.svg"
                    alt="netlify"
                    className="min-w-12 hover:opacity-80"
                  />
                </a>

                <div className="flex flex-col text-left">
                  <div className=" text-black text-xl font-black">Netlify</div>
                  <div className="text-sm text-gray-500">Deploy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-32 bg-[#252641]">
        <div className="max-w-lg mx-auto">
          <div className="flex flex-col md:flex-row gap-4 py-12 justify-center text-white items-center px-20 sm:px-36">
            <img src={logo} alt="logo" />

            <span className="text-sm pl-5 py-2 font-semibold whitespace-nowrap">
              Step Leader React <span className="text-yellow-500">v1.31</span>
              <br />
              <br />
              <Link to="/privacy" className="font-normal">
                Polityka Prywatności
              </Link>
            </span>
          </div>

          <div className="text-center text-white">
            <p className="my-3 text-gray-400 text-sm">
              &copy; 2025 created by <span className="font-semibold">karolskolasinski</span>
            </p>
            <div className="py-3 tracking-wide" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
