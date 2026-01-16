export const metadata = {
  title: 'Shipping Policy - Fun Prints',
  description: 'Shipping and delivery information for Fun Prints',
};

export default function Shipping() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="text-4xl font-bold mb-8">Shipping Policy</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Shipping Coverage</h2>
              <p className="text-gray-600">
                We currently ship across India. International shipping is not available at this time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Delivery Time</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Metro cities: 3-5 business days</li>
                <li>Other cities: 5-7 business days</li>
                <li>Remote areas: 7-10 business days</li>
                <li>Bulk orders: 7-14 business days (depending on quantity)</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Note: Delivery times are estimates and may vary during peak seasons or due to 
                unforeseen circumstances.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Shipping Charges</h2>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-900 font-semibold">
                  🎉 FREE SHIPPING on all orders!
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Order Tracking</h2>
              <p className="text-gray-600">
                Once your order is dispatched, you will receive:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Tracking number via SMS and email</li>
                <li>WhatsApp notification with tracking link</li>
                <li>Real-time updates on delivery status</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Order Processing</h2>
              <p className="text-gray-600">
                Orders are processed within 24-48 hours after payment verification. 
                Custom designs may require additional processing time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Delivery Partners</h2>
              <p className="text-gray-600">
                We work with trusted courier partners including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Delhivery</li>
                <li>Blue Dart</li>
                <li>DTDC</li>
                <li>India Post</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Failed Delivery</h2>
              <p className="text-gray-600">
                If delivery fails due to incorrect address or unavailability:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Courier will attempt delivery 2-3 times</li>
                <li>You'll be contacted for address confirmation</li>
                <li>Additional charges may apply for re-delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-gray-600">
                For shipping queries:
                <br />
                Email: shipping@funprints.com
                <br />
                Phone: +91 98765 43210
                <br />
                WhatsApp: +91 98765 43210
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
