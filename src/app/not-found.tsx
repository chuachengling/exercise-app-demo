export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="text-6xl mb-6">🏃‍♂️</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Oops! Page not found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Looks like you've wandered off your fitness path. Let's get you back on track!
        </p>
        <div className="space-y-4">
          <a
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            🏠 Go Home
          </a>
          <a
            href="/signup/goals"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-6 rounded-xl transition-colors duration-200"
          >
            🎯 Choose Goals
          </a>
        </div>
      </div>
    </div>
  );
}