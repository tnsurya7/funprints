import CheckoutForm from '@/components/checkout/CheckoutForm';

export const metadata = {
  title: 'Checkout - Fun Print',
  description: 'Complete your order',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 bg-gray-50/70">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-black mb-4 sm:mb-6 text-gray-950">Checkout</h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
