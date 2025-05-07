import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Name Draw</title>
        <meta name="description" content="Terms of Service for Name Draw Slack app" />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-32 pb-20">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Terms of Service
            </h1>
            
            <div className="prose dark:prose-invert max-w-none">
              <p>Last updated: March 31, 2025</p>
              
              <h2>Introduction</h2>
              <p>
                These Terms of Service ("Terms") govern your access to and use of Name Draw, a Slack application 
                for random team member selection ("Service"). Please read these Terms carefully before using the Service.
              </p>
              <p>
                By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part 
                of the Terms, you may not access the Service.
              </p>
              
              <h2>Use of the Service</h2>
              <p>
                Name Draw provides a Slack application that allows users to randomly select team members for various purposes. 
                By using our Service, you agree to:
              </p>
              <ul>
                <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
                <li>Not use the Service in any way that violates any applicable law or regulation</li>
                <li>Not attempt to probe, scan, or test the vulnerability of the Service</li>
                <li>Not interfere with or disrupt the integrity or performance of the Service</li>
              </ul>
              
              <h2>Accounts and Subscription</h2>
              <p>
                Some features of the Service require a paid subscription. When you subscribe to a paid plan:
              </p>
              <ul>
                <li>You agree to provide accurate and complete billing information</li>
                <li>You authorize us to charge your payment method for the selected plan</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>Refunds are provided in accordance with our refund policy</li>
              </ul>
              
              <h2>Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive 
                property of Name Draw and its licensors. The Service is protected by copyright, trademark, and other 
                laws of both the United States and foreign countries.
              </p>
              
              <h2>User Content</h2>
              <p>
                Our Service allows you to create and store certain data, such as custom groups and selection history. 
                You retain all rights to your data, and you are responsible for all data you create using the Service.
              </p>
              
              <h2>Disclaimer of Warranties</h2>
              <p>
                The Service is provided "as is" and "as available" without any warranties of any kind, either express 
                or implied. We do not guarantee that the Service will be uninterrupted, timely, secure, or error-free.
              </p>
              
              <h2>Limitation of Liability</h2>
              <p>
                In no event shall Name Draw, its directors, employees, partners, agents, suppliers, or affiliates be 
                liable for any indirect, incidental, special, consequential, or punitive damages, including without 
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your 
                access to or use of or inability to access or use the Service.
              </p>
              
              <h2>Termination</h2>
              <p>
                We may terminate or suspend your access to the Service immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              
              <h2>Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
                provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change 
                will be determined at our sole discretion.
              </p>
              
              <h2>Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States, 
                without regard to its conflict of law provisions.
              </p>
              
              <h2>Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                <a href="mailto:legal@namedraw.app" className="text-purple-600 dark:text-purple-400 hover:underline">
                  legal@namedraw.app
                </a>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
