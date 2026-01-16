import CheckoutForm from '@/components/checkout/CheckoutForm';

export const metadata = {
  title: 'Checkout - Fun Prints',
  description: 'Complete your order',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
