"use client";

interface Props {
  onSignIn: () => void;
}

export default function LoginScreen({ onSignIn }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 text-center max-w-sm w-full shadow-sm">
        <div className="text-5xl mb-5">📺</div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">Video Sharing</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">Sign in to create and join shared video sessions.</p>
        <button
          onClick={onSignIn}
          className="w-full py-3 rounded-lg text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition"
        >
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
}
