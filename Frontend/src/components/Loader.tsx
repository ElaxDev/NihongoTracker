function Loader() {
  return (
    <div className="fixed flex top-0 left-0 justify-center items-center w-full h-full z-50 bg-black/[0.5]">
      <span className="m-auto loading loading-spinner text-primary"></span>
    </div>
  );
}

export default Loader;
