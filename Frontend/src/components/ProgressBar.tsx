function ProgressBar({
  progress,
  maxProgress,
  progressColor,
}: {
  progress?: number;
  maxProgress?: number;
  progressColor?: string;
}) {
  return (
    <progress
      className={
        progressColor
          ? `progress w-full progress-${progressColor}`
          : 'progress w-full'
      }
      value={progress ? progress : 0}
      max={maxProgress ? maxProgress : 100}
    ></progress>
  );
}

export default ProgressBar;
