export const metadata = {
  title: 'Returns & Refunds - Fun Prints',
  description: 'Return and refund policy for Fun Prints',
};

export default function Returns() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <h1 className="text-4xl font-bold mb-8">Returns & Refunds Policy</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Return Eligibility</h2>
              <p className="text-gray-600 mb-2">
                We accept returns only in the following cases:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Manufacturing defects</li>
                <li>Wrong product delivered</li>
                <li>Damaged product received</li>
                <li>Print quality issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Return Process</h2>
              <ol className="list-decimal pl-6 text-gray-600 space-y-2">
                <li>Contact us within 48 hours of receiving the product</li>
                <li>Provide order ID and photos of the issue</li>
                <li>Our team will review and approve the return</li>
                <li>Ship the product back to us (we'll provide the address)</li>
                <li>Refund will be processed within 7-10 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Non-Returnable Items</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Custom printed products (unless defective)</li>
                <li>Products used or washed</li>
                <li>Products without original packaging</li>
                <li>Products returned after 7 days of delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Refund Method</h2>
              <p className="text-gray-600">
                Refunds will be processed to the original payment method:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>UPI payments: Refunded to the same UPI ID</li>
                <li>COD orders: Bank transfer (provide account details)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Exchange Policy</h2>
              <p className="text-gray-600">
                We offer size exchanges within 7 days of delivery. The product must be unworn, 
                unwashed, and in original condition. Shipping charges for exchange are borne by the customer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-gray-600">
                For return requests or queries:
                <br />
                Email: returns@funprints.com
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
