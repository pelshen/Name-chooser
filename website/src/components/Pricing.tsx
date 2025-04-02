export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose the plan that works best for your team
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border ${
                plan.popular 
                  ? 'border-purple-500 relative' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                  {plan.period && <span className="text-gray-500 dark:text-gray-400">/{plan.period}</span>}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex justify-center items-center rounded-md px-4 py-2 text-sm font-medium ${
                    plan.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 transition-colors`}
                >
                  {plan.buttonText}
                </a>
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
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
          >
            Contact Sales
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Free",
    price: "0",
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
  },
  {
    name: "Pro",
    price: "5",
    period: "month",
    description: "Ideal for growing teams with regular needs",
    features: [
      "Up to 50 team members",
      "Advanced selection options",
      "Unlimited selections",
      "30-day history",
      "Custom groups",
      "Exclusion rules",
    ],
    buttonText: "Get Pro",
    buttonLink: "https://slack.com/apps",
    popular: true,
  },
  {
    name: "Business",
    price: "12",
    period: "month",
    description: "For larger teams with advanced requirements",
    features: [
      "Unlimited team members",
      "All Pro features",
      "Weighted selection",
      "Unlimited history",
      "Analytics dashboard",
      "Priority support",
    ],
    buttonText: "Get Business",
    buttonLink: "https://slack.com/apps",
    popular: false,
  },
];
