export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to Exercise App
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Your journey to better health starts here.
        </p>
        <div className="space-y-4">
          <a
            href="/signup/goals"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-150"
          >
            Get Started
          </a>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose your health goals and start tracking your progress
          </p>
        </div>
      </div>
    </div>
  );
}