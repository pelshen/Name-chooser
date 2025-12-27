import { useEffect } from 'react';

export default function Newsletter() {
  useEffect(() => {
    // Load MailerLite script
    const script = document.createElement('script');
    script.src = 'https://groot.mailerlite.com/js/w/webforms.min.js?v176e10baa5e7ed80d35ae235be3d5024';
    script.async = true;
    document.body.appendChild(script);

    // Track form load
    fetch('https://assets.mailerlite.com/jsonp/1860990/forms/169183635776210755/takel').catch(() => {});

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <section id="newsletter" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Stay updated
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get notified about new features, updates, and tips for using Name Draw
            </p>
          </div>

          {/* MailerLite Embed */}
          <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md">
            <div
              id="mlb2-32503995"
              className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-32503995"
            >
              <div className="ml-form-align-left">
                <div className="ml-form-embedWrapper embedForm">
                  <div className="ml-form-embedBody ml-form-embedBodyDefault row-form">
                    <div className="ml-form-embedContent" style={{ marginBottom: '20px' }}>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Updates</h4>
                      <p className="text-gray-600 dark:text-gray-300">Sign up for product updates</p>
                    </div>

                    <form
                      className="ml-block-form"
                      action="https://assets.mailerlite.com/jsonp/1860990/forms/169183635776210755/subscribe"
                      data-code=""
                      method="post"
                      target="_blank"
                    >
                      <div className="ml-form-formContent">
                        <div className="ml-form-fieldRow ml-last-item">
                          <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                            <input
                              aria-label="email"
                              aria-required="true"
                              type="email"
                              className="form-control w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-600 dark:text-white"
                              name="fields[email]"
                              placeholder="Enter your email"
                              autoComplete="email"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="ml-form-embedPermissions mt-4">
                        <div className="ml-form-embedPermissionsContent default privacy-policy">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            You can unsubscribe anytime. For more details, review our Privacy Policy.
                          </p>
                        </div>
                      </div>

                      <input type="hidden" name="ml-submit" value="1" />
                      <input type="hidden" name="anticsrf" value="true" />

                      <div className="ml-form-embedSubmit mt-6">
                        <button
                          type="submit"
                          className="primary w-full bg-primary hover:bg-accent1 text-white font-semibold py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          Subscribe
                        </button>
                        <button
                          disabled
                          style={{ display: 'none' }}
                          type="button"
                          className="loading"
                        >
                          <div className="ml-form-embedSubmitLoad"></div>
                          <span className="sr-only">Loading...</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="ml-form-successBody row-success" style={{ display: 'none' }}>
                    <div className="ml-form-successContent">
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Thank you!</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        You have successfully joined our subscriber list.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MailerLite Success Handler Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            function ml_webform_success_32503995() {
              try {
                window.top.location.href = 'https://name-draw.com?emailSignupSuccess=true';
              } catch (e) {
                window.location.href = 'https://name-draw.com?emailSignupSuccess=true';
              }
            }
          `,
        }}
      />
    </section>
  );
}
