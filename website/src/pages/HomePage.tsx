import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import Features from "../components/Features";
import Header from "../components/Header";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
// import Pricing from '../components/Pricing';
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import Newsletter from "../components/Newsletter";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check if user was redirected after email signup
    if (searchParams.get("emailSignupSuccess") === "true") {
      toast.success(
        "Thanks for signing up! Check your email to confirm your subscription.",
        {
          duration: 5000,
          icon: "✉️",
        },
      );
      // Remove the parameter from URL to keep it clean
      searchParams.delete("emailSignupSuccess");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <Helmet>
        <title>Name Draw - Random Selection for Slack</title>
        <meta
          name="description"
          content="Name Draw is a Slack app that makes random team member selection simple, fair, and fun. Perfect for standups, code reviews, and team activities."
        />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          {/* <Testimonials /> We have none yet! */}
          {/* <Pricing /> */}
          <Newsletter />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
