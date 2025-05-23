import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import TermsPage from './pages/TermsPage';
import ErrorPage from './pages/ErrorPage';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import DynamicPage from './pages/DynamicPage';
import { Account } from "./pages/Account";
import SubscriptionPage from "./pages/SubscriptionPage";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'blog',
        element: <Blog />,
      },
      {
        path: 'blog/:slug',
        element: <BlogPost />,
      },
      {
        path: 'privacy',
        element: <DynamicPage />,
      },
      {
        path: 'pages/:slug',
        element: <DynamicPage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
      {
        path: 'account',
        element: <Account />,
      },
      {
        path: 'subscription',
        element: <SubscriptionPage />,
      },
    ],
  },
]);
