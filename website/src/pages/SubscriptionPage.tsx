import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { LoginButton } from '@/components/LoginButton';
import type { AccountUser } from '@/types';
import { initializePaddle } from '@paddle/paddle-js';

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
const PADDLE_PRO_MONTHLY_PRICE_ID = import.meta.env
  .VITE_PADDLE_PRO_MONTHLY_PRICE_ID;
const PADDLE_PRO_ANNUAL_PRICE_ID = import.meta.env
  .VITE_PADDLE_PRO_ANNUAL_PRICE_ID;
const apiHost = import.meta.env.VITE_API_HOST;

function SubscriptionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 flex justify-center items-start">
        <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 max-w-2xl w-full p-8 mt-12 mb-16 flex flex-col items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(false);
  const [proPrice, setProPrice] = useState<string | null>(null);
  const [proPriceLoading, setProPriceLoading] = useState(false);

  const proPriceId = isAnnual
    ? PADDLE_PRO_ANNUAL_PRICE_ID
    : PADDLE_PRO_MONTHLY_PRICE_ID;

  // Fetch user data
  useEffect(() => {
    fetch(`${apiHost}/api/account`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data) => {
        setUser(data.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Account fetch error:', err);
        setLoading(false);
      });
  }, []);

  // Fetch Paddle price
  useEffect(() => {
    let isMounted = true;

    async function fetchProPrice() {
      setProPriceLoading(true);
      setProPrice(null);

      try {
        const paddle = await initializePaddle({ token: PADDLE_CLIENT_TOKEN });

        if (!paddle || !proPriceId)
          throw new Error('Paddle not initialized or priceId missing');

        if (process.env.NODE_ENV !== 'production') {
          paddle.Environment.set('sandbox');
        }

        const preview = await paddle.PricePreview({
          items: [{ priceId: proPriceId, quantity: 1 }],
        });

        // Find the price for this item
        const lineItems = preview.data.details.lineItems;
        const price = lineItems.find(
          (li) => li.price.id === proPriceId,
        )?.formattedTotals;

        if (isMounted) {
          setProPrice(price ? price.total : null);
        }
      } catch (e) {
        if (isMounted) setProPrice(null);
      } finally {
        if (isMounted) setProPriceLoading(false);
      }
    }

    fetchProPrice();
    return () => {
      isMounted = false;
    };
  }, [isAnnual, proPriceId]);

  // Handle subscription purchase
  const handleSubscribe = async () => {
    try {
      const paddle = await initializePaddle({
        token: PADDLE_CLIENT_TOKEN,
      });

      if (!proPriceId) throw new Error('No priceId set for this plan');

      paddle?.Checkout.open({
        settings: { displayMode: 'overlay', theme: 'light' },
        items: [{ priceId: proPriceId, quantity: 1 }],
      });
    } catch (err) {
      alert(
        'Paddle failed to load or is misconfigured. Please check your setup.',
      );
    }
  };

  let cardContent: React.ReactNode;

  if (loading) {
    cardContent = (
      <>
        <div className="mb-6 flex justify-center">
          <span
            className="inline-block w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"
            aria-label="Loading spinner"
          ></span>
        </div>
        <div className="text-lg text-gray-300 text-center">
          Loading your subscription details...
        </div>
      </>
    );
  } else if (!user) {
    cardContent = (
      <>
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          You need to sign in first
        </h1>
        <p className="text-gray-300 text-center mb-6">
          To manage your subscription, please sign in with Slack using the
          button below.
        </p>
        <LoginButton />
      </>
    );
  } else if (user.plan === 'PRO') {
    cardContent = (
      <>
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Your Subscription
        </h1>
        <div className="bg-green-800/30 border border-green-600/30 rounded-lg p-6 mb-8 w-full">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="flex items-center justify-center bg-green-500 h-12 w-12 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
            <h2 className="text-xl font-bold text-white">
              You have an active Pro subscription
            </h2>
          </div>
          <p className="text-gray-300 text-center">
            Your team is enjoying all the benefits of our Pro plan.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-6 w-full">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            Subscription Management
          </h3>
          <p className="text-gray-400 text-center mb-6">
            Cancellation option coming soon. If you need to cancel your
            subscription immediately, please contact our support team.
          </p>
          <a
            href="mailto:support@namedraw.app"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </>
    );
  } else {
    cardContent = (
      <>
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Upgrade to Pro
        </h1>

        <div className="w-full mb-8">
          <div className="flex justify-center items-center mb-8">
            <span
              className={`mr-3 font-medium ${!isAnnual ? 'text-accent1' : 'text-gray-400'}`}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isAnnual}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-accent1' : 'bg-gray-500'
              }`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`ml-3 font-medium ${isAnnual ? 'text-accent1' : 'text-gray-400'}`}
            >
              Annual (Save 17%)
            </span>
          </div>

          <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg border border-gray-600">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">
                  {proPriceLoading ? '...' : (proPrice ?? '?')}
                </span>
                <span className="text-gray-300">
                  /{isAnnual ? 'year' : 'month'}
                </span>
              </div>
              <p className="text-gray-300 mb-6">
                {isAnnual
                  ? 'Best value for teams ready to commit. Save 17%!'
                  : 'Ideal for growing teams with regular needs'}
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">Up to 50 team members</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">
                    Advanced selection options
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">Unlimited selections</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">30-day history</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">Custom groups</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300">Exclusion rules</span>
                </li>
              </ul>

              <button
                type="button"
                className="w-full inline-flex justify-center items-center rounded-md px-4 py-3 text-base font-medium bg-primary text-white hover:bg-accent1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-colors"
                onClick={handleSubscribe}
                disabled={proPriceLoading}
              >
                {proPriceLoading ? 'Loading...' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-24 flex flex-col justify-between">
        <SubscriptionCard>{cardContent}</SubscriptionCard>
        <Footer />
      </div>
    </>
  );
}
