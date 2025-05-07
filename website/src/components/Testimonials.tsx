export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Loved by teams everywhere
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See what teams are saying about Name Draw:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold mr-3">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.title}, {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 flex flex-wrap justify-center gap-8 items-center">
          <p className="text-xl font-semibold text-gray-900 dark:text-white">Trusted by teams at:</p>
          {companies.map((company, index) => (
            <div key={index} className="text-gray-400 dark:text-gray-500 text-xl font-bold">
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote: "Name Draw has completely transformed our daily standups. No more awkward 'who wants to go next?' moments. It's fair, fun, and keeps everyone engaged.",
    name: "Sarah Johnson",
    title: "Engineering Manager",
    company: "TechCorp",
  },
  {
    quote: "We use Name Draw for selecting code reviewers, and it's been a game-changer. The weighted selection feature ensures workload is distributed fairly across the team.",
    name: "Michael Chen",
    title: "Lead Developer",
    company: "CodeWorks",
  },
  {
    quote: "Simple, effective, and actually fun to use. Our team loves the random selection process - it adds a bit of excitement to our meetings and keeps things fair.",
    name: "Jessica Rodriguez",
    title: "Product Manager",
    company: "InnovateLabs",
  },
];

const companies = [
  "ACME Corp",
  "TechGiant",
  "InnovateCo",
  "FutureSoft",
  "DevTeam",
];
