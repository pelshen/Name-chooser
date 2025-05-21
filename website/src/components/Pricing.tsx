import { useState, useEffect } from "react";
import { initializePaddle } from '@paddle/paddle-js';

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
const PADDLE_PRO_MONTHLY_PRICE_ID = import.meta.env.VITE_PADDLE_PRO_MONTHLY_PRICE_ID;
const PADDLE_PRO_ANNUAL_PRICE_ID = import.meta.env.VITE_PADDLE_PRO_ANNUAL_PRICE_ID;

type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonLink?: string;
  popular: boolean;
  priceId?: string;
};

export default function Pricing() {
  // Toggle state: true = annual, false = monthly
  const [isAnnual, setIsAnnual] = useState(false);

  // Pricing data based on toggle
  // State for dynamic Paddle price
  const [proPrice, setProPrice] = useState<string | null>(null);
  const [proPriceLoading, setProPriceLoading] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const proPriceId = isAnnual ? PADDLE_PRO_ANNUAL_PRICE_ID : PADDLE_PRO_MONTHLY_PRICE_ID;

  useEffect(() => {
    let isMounted = true;
    async function fetchProPrice() {
      setProPriceLoading(true);
      setProPrice(null);
      try {
        // Dynamically import Paddle.js
        const paddle = await initializePaddle({ token: PADDLE_CLIENT_TOKEN });
        if (!paddle || !proPriceId) throw new Error('Paddle not initialized or priceId missing');
        if (process.env.NODE_ENV !== 'production') {
          paddle.Environment.set('sandbox');
        }
        const preview = await paddle.PricePreview({
          items: [{ priceId: proPriceId, quantity: 1 }],
        });
        // Find the price for this item (type guard for preview.totals)
        const lineItems = preview.data.details.lineItems;
        const price = lineItems.find((li) => li.price.id === proPriceId)?.formattedTotals;
        if (isMounted) {
          setProPrice(price ? price.total : null);
          setCurrencySymbol(price ? price.total[0] : '$');
        }
      } catch (e) {
        if (isMounted) setProPrice(null);
      } finally {
        if (isMounted) setProPriceLoading(false);
      }
    }
    fetchProPrice();
    return () => { isMounted = false; };
  }, [isAnnual, proPriceId]);

  const proPlan: Plan = {
    name: "Pro",
    price: proPriceLoading ? '...' : (proPrice ?? '?'),
    period: isAnnual ? "year" : "month",
    description: isAnnual
      ? "Best value for teams ready to commit. Save 17%!"
      : "Ideal for growing teams with regular needs",
    features: [
      "Up to 50 team members",
      "Advanced selection options",
      "Unlimited selections",
      "30-day history",
      "Custom groups",
      "Exclusion rules",
    ],
    buttonText: isAnnual ? "Get Pro Annually" : "Get Pro Monthly",
    buttonLink: undefined,
    popular: true,
    priceId: proPriceId,
  };

  const plans: Plan[] = [
    {
      name: "Free",
      price: `${currencySymbol}0`,
      period: "forever",
      description: "Perfect for small teams just getting started",
      features: [
        "Up to 10 team members",
        "Basic random selection",
        "5 selections per day",
        "7-day history",
      ],
      buttonText: "Get Started Free",
      buttonLink: "https://slack.com/apps",
      popular: false,
      priceId: undefined,
    },
    proPlan
  ];

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose the plan that works best for your team:
          </p>
        </div>

        {/* Toggle slider for monthly/annual */}
        <div className="flex justify-center items-center mb-12">
          <span className={`mr-3 font-medium ${!isAnnual ? 'text-accent1' : 'text-gray-500 dark:text-gray-400'}`}>Monthly</span>
          <button
            type="button"
            className="relative inline-flex h-6 w-12 border-2 border-accent2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent1 mx-2"
            onClick={() => setIsAnnual(!isAnnual)}
            aria-pressed={isAnnual}
            aria-label="Toggle annual/monthly pricing"
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-accent1 shadow transform transition-transform duration-200 ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
          <span className={`ml-3 font-medium ${isAnnual ? 'text-accent1' : 'text-gray-500 dark:text-gray-400'}`}>Annual</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto justify-center">
          {plans.map((plan: Plan, index: number) => (
            <div 
              key={index} 
              className={`bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md border-2 border-accent2/30 dark:border-accent2 flex flex-col items-center ${
                plan.popular 
                  ? 'border-accent1 relative' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-accent1 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Most popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.priceId ? (
  <button
    type="button"
    className={`w-full inline-flex justify-center items-center rounded-md px-4 py-2 text-sm font-medium ${
      plan.popular
        ? 'bg-primary text-white hover:bg-accent1'
        : 'bg-gray-100 text-accent2 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
    } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-colors`}
    onClick={async () => {
      try {
        const { initializePaddle } = await import('@paddle/paddle-js');
        const paddle = await initializePaddle({
          token: PADDLE_CLIENT_TOKEN,
        });
        if (!plan.priceId) throw new Error('No priceId set for this plan');
        paddle?.Checkout.open({
          settings: { displayMode: 'overlay', theme: 'light' },
          items: [{ priceId: plan.priceId, quantity: 1 }],
        });
      } catch (err) {
        alert('Paddle failed to load or is misconfigured. Please check your setup.');
      }
    }}
  >
    {plan.buttonText}
  </button>
) : (
  <a
    href={plan.buttonLink}
    target="_blank"
    rel="noopener noreferrer"
    className={`w-full inline-flex justify-center items-center rounded-md px-4 py-2 text-sm font-medium ${
      plan.name === 'Free'
        ? 'bg-primary text-white hover:bg-accent1 shadow-lg'
        : plan.popular
          ? 'bg-primary text-white hover:bg-accent1'
          : 'bg-gray-100 text-accent2 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
    } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-colors`}
  >
    {plan.buttonText}
  </a>
)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Need a custom plan?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We offer custom plans for larger teams with specific needs. Contact us to discuss your requirements.
          </p>
          <a
            href="mailto:sales@namedraw.app"
            className="inline-flex items-center text-accent2 dark:text-accent1 hover:text-accent1 dark:hover:text-accent2"
          >
            Contact sales
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
