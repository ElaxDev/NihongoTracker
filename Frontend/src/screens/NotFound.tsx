function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-base-300">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-2">
        Oops! The page you are looking for does not exist.
      </p>
      <p className="text-sm text-gray-600">
        While we are here go immerse a bit!
      </p>
    </div>
  );
}

export default NotFound;
