export default function ProfileSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          🎉 Goal Selected!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Your health goal has been saved successfully. The profile setup step will be implemented in a future story.
        </p>
        <div className="space-y-4">
          <a
            href="/signup/goals"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-150"
          >
            ← Back to Goals
          </a>
          <a
            href="/"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-lg transition-colors duration-150"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}