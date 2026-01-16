export const metadata = {
  title: 'Terms & Conditions - Fun Prints',
  description: 'Terms and conditions for Fun Prints services',
};

export default function Terms() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using Fun Prints services, you accept and agree to be bound by 
                these Terms and Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Products and Services</h2>
              <p className="text-gray-600">
                We offer custom t-shirt printing services. All product descriptions, images, and 
                specifications are provided for informational purposes and may vary slightly from 
                the actual product.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Orders and Payment</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>All orders are subject to acceptance and availability</li>
                <li>Prices are in Indian Rupees (INR) and include applicable taxes</li>
                <li>We accept UPI payments and Cash on Delivery</li>
                <li>Payment must be verified before order processing begins</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Delivery</h2>
              <p className="text-gray-600">
                Delivery times are estimates and may vary. We are not responsible for delays 
                caused by courier services or circumstances beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Returns and Refunds</h2>
              <p className="text-gray-600">
                Custom printed products are non-returnable unless there is a manufacturing defect. 
                Please refer to our Returns Policy for detailed information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-gray-600">
                You are responsible for ensuring you have the rights to any designs or images 
                you submit for printing. We are not liable for copyright infringement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-600">
                Fun Prints shall not be liable for any indirect, incidental, or consequential 
                damages arising from the use of our products or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
              <p className="text-gray-600">
                For questions about these Terms, contact us at:
                <br />
                Email: support@funprints.com
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
