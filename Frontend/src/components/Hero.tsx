import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse gap-12">
        <div className="max-w-sm lg:max-w-md">
          <div className="card card-bordered shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-center justify-center border-b pb-2">
                学習の進捗 (Learning Progress)
              </h2>

              <div className="grid grid-cols-1 gap-6 mt-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-primary-content p-4 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="w-8 h-8 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold">Reading - 読む</div>
                    <div className="text-3xl font-extrabold">42</div>
                    <div className="text-sm opacity-70">books completed</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-secondary text-secondary-content p-4 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="w-8 h-8 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold">Listening - 聞く</div>
                    <div className="text-3xl font-extrabold">156</div>
                    <div className="text-sm opacity-70">hours immersed</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-success text-success-content p-4 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="w-8 h-8 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 19.5h18M5 17l3.5-3.5m0 0l3 3L18 10"
                      ></path>
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-bold">Immersion - 浸す</div>
                    <div className="text-3xl font-extrabold">215</div>
                    <div className="text-sm opacity-70">
                      total hours this month
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-actions justify-center mt-4 pt-2 border-t">
                <div className="stats shadow stats-horizontal bg-base-100">
                  <div className="stat place-items-center">
                    <div className="stat-title">Rank</div>
                    <div className="stat-value text-2xl">3rd</div>
                    <div className="stat-desc">among friends</div>
                  </div>
                  <div className="stat place-items-center">
                    <div className="stat-title">Streak</div>
                    <div className="stat-value text-2xl text-success">14</div>
                    <div className="stat-desc">consecutive days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-5xl font-bold">NihongoTracker</h1>
          <p className="py-6">
            <b className="text-primary">Gamify</b> your Japanese immersion
            journey with NihongoTracker.
            <br />
            Track, compete, and learn with friends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link className="btn btn-primary" to="/login">
              Get Started
            </Link>
            <button className="btn btn-outline">Tour Features</button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <div className="badge badge-outline">読む Reading</div>
            <div className="badge badge-outline">聞く Listening</div>
            <div className="badge badge-outline">浸す Immersion</div>
            <div className="badge badge-outline">統計 Statistics</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
