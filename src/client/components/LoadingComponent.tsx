interface LoadingComponentProps {
  isShowBackgroundImage: boolean;
}

export function LoadingComponent({ isShowBackgroundImage = true }: LoadingComponentProps) {
  return (
    <div className={`loader-overlay ${isShowBackgroundImage ? 'dark-bg' : ''}`}>
      <img src="/loading.gif" alt="Animated progress indicator" className="loader-spinner" />
    </div>
  );
}