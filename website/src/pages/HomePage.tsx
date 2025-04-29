import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Name Draw - Random Selection for Slack</title>
        <meta name="description" content="Name Draw is a Slack app that makes random team member selection simple, fair, and fun. Perfect for standups, code reviews, and team activities." />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          {/* <Testimonials /> We have none yet! */}
          <Pricing />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
