import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function ErrorPage() {
  const error = useRouteError();
  
  let errorMessage: string;
  let statusText: string = '';
  let status: number = 500;
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.data.message || 'An unexpected error occurred';
    statusText = error.statusText;
    status = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'An unexpected error occurred';
  }

  return (
    <>
      <Helmet>
        <title>Error - Name Draw</title>
        <meta name="description" content="Error page" />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-4 text-center">
        <img src="/name-draw-logo.svg" alt="Name Draw" className="h-16 w-16 mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {status} {statusText && `- ${statusText}`}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {errorMessage}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-purple-600 px-6 py-3 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </>
  );
}
