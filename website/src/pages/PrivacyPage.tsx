import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Name Draw</title>
        <meta name="description" content="Privacy Policy for Name Draw Slack app" />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-32 pb-20">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose dark:prose-invert max-w-none">
              <p>Last updated: March 31, 2025</p>
              
              <h2>Introduction</h2>
              <p>
                At Name Draw ("we", "our", or "us"), we respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you use our Slack application 
                and tell you about your privacy rights.
              </p>
              
              <h2>Data We Collect</h2>
              <p>
                When you install and use Name Draw, we collect the following information:
              </p>
              <ul>
                <li>Your Slack workspace name and ID</li>
                <li>User names and IDs of members in your workspace</li>
                <li>Channel names and IDs where Name Draw is used</li>
                <li>Selection history (who was selected and when)</li>
                <li>Custom groups you create within the app</li>
              </ul>
              
              <h2>How We Use Your Data</h2>
              <p>
                We use the data we collect to:
              </p>
              <ul>
                <li>Provide and maintain the Name Draw service</li>
                <li>Track selection history to ensure fair distribution</li>
                <li>Improve and optimize the app functionality</li>
                <li>Respond to your requests or questions</li>
                <li>Send you important information about the service</li>
              </ul>
              
              <h2>Data Sharing and Disclosure</h2>
              <p>
                We do not sell your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul>
                <li>With service providers who help us operate the app</li>
                <li>If required by law or to respond to legal process</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              
              <h2>Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal data against unauthorized access, 
                alteration, disclosure, or destruction. All data is encrypted in transit and at rest.
              </p>
              
              <h2>Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal data, including:
              </p>
              <ul>
                <li>The right to access your data</li>
                <li>The right to correct inaccurate data</li>
                <li>The right to delete your data</li>
                <li>The right to restrict processing</li>
                <li>The right to data portability</li>
              </ul>
              
              <h2>Data Retention</h2>
              <p>
                We retain your data for as long as your Slack workspace uses Name Draw. If you uninstall the app, 
                we will delete your data within 30 days, except where we are required to retain it for legal purposes.
              </p>
              
              <h2>Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting 
                the new privacy policy on this page and updating the "Last updated" date.
              </p>
              
              <h2>Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <p>
                <a href="mailto:privacy@namedraw.app" className="text-purple-600 dark:text-purple-400 hover:underline">
                  privacy@namedraw.app
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
