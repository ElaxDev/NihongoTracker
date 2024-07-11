const Card = () => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-base-200 m-4">
      <img
        className="w-full"
        src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx5680-Hw0SQuKGa9kl.png" // Replace with your image URL
        alt="K-ON!"
      />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">
          Watched episode 3 - 7 of K-ON!
        </div>
        <p className="text-gray-500 text-sm">2 days ago</p>
      </div>
      <div className="px-6 pt-4 pb-2 flex items-center">
        <span className="inline-flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-9h2v5h-2v-5zm1-3.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
          </svg>
          1
        </span>
        <span className="inline-flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6l-4 4V2z" />
          </svg>
          0
        </span>
      </div>
    </div>
  );
};

export default Card;
