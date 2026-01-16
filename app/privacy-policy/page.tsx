export const metadata = {
  title: 'Privacy Policy - Fun Prints',
  description: 'Privacy policy for Fun Prints custom t-shirt services',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-gray-600">
                We collect information you provide directly to us, including name, email address, 
                phone number, shipping address, and payment information when you place an order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-2">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our products and services</li>
                <li>Send promotional communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
              <p className="text-gray-600">
                We do not sell, trade, or rent your personal information to third parties. 
                We may share your information with service providers who assist us in operating 
                our business, such as payment processors and shipping companies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information 
                from unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
              <p className="text-gray-600 mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about this Privacy Policy, please contact us at:
                <br />
                Email: privacy@funprints.com
                <br />
                Phone: +91 98765 43210
              </p>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              Last updated: January 16, 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
