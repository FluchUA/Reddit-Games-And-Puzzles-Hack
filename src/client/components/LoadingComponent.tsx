export function LoadingComponent() {
  return (
    <div className={"loader-overlay"}>
      <img
        src="/loading.gif"
        alt="Animated progress indicator"
        className="loader-spinner"
      />
    </div>
  );
}