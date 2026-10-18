import { ShieldCheck, Video, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Refund and Exchange Policy - FunPrint',
  description: 'Official Refund, Exchange, and Cancellation Policy for FunPrint (OSHIVO EXIM OPC PVT LTD)',
};

export default function Returns() {
  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 bg-slate-50/70 font-serif">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-xs space-y-8">
          {/* Header */}
          <div className="border-b border-gray-100 pb-6">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 inline-block mb-3">
              Official FunPrint Policy
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mb-2">
              Refund and Exchange Policy
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Please review our official refund, exchange, and cancellation terms for plain t-shirts and custom bulk orders.
            </p>
          </div>

          {/* Refund Policy */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-900" />
              <h2 className="text-xl font-bold text-gray-950">Refund Policy</h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 leading-relaxed pl-7">
              <p>
                <strong className="text-gray-950">Plain T-shirts:</strong> Refunds will only be granted if the product is found to be damaged upon delivery, or if the courier package is tampered with. In such cases, customers must provide a video of the package being opened as evidence to claim a refund. Without this video proof, refund requests will not be entertained.
              </p>
              <p>
                <strong className="text-gray-950">Custom T-shirts (Bulk Orders):</strong> Custom bulk orders are non-refundable and non-cancellable once production has begun, as these products are specially made for you and cannot be resold.
              </p>
            </div>
          </section>

          {/* Opening Video Notice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3.5">
            <Video className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
              <strong className="block font-bold mb-1">Package Unboxing Video Proof Required:</strong>
              In the case of a damaged product or tampered courier packaging, customers must provide a video of the package being opened to initiate a refund or replacement request. Claims without proper evidence will not be entertained.
            </div>
          </div>

          {/* Exchange Policy */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gray-900" />
              <h2 className="text-xl font-bold text-gray-950">Exchange Policy</h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 leading-relaxed pl-7">
              <p>
                <strong className="text-gray-950">Size Exchanges (Plain T-shirts Only):</strong> If you find that the size of a plain t-shirt does not fit, we offer an exchange for a different size. No refunds will be provided in case of size issues, and exchanges are subject to the availability of stock.
              </p>
            </div>
          </section>

          {/* Cancellations */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gray-900" />
              <h2 className="text-xl font-bold text-gray-950">Cancellations</h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 leading-relaxed pl-7">
              <p>
                <strong className="text-gray-950">Plain T-shirts:</strong> Orders for plain t-shirts can be cancelled if the cancellation request is made before the order has been dispatched. Once the order has been dispatched, cancellations will not be accepted.
              </p>
              <p>
                <strong className="text-gray-950">Custom Bulk Orders:</strong> Once the order for customized t-shirts has been placed and production has started, no cancellations will be allowed under any circumstances.
              </p>
            </div>
          </section>

          {/* Contact Support */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-600 leading-relaxed flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="font-bold text-gray-900">Need help with an order or exchange?</p>
              <p>Contact our support team with your order details and video proof.</p>
            </div>
            <div className="flex gap-2">
              <a
                href={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/\D/g, '')}` : '/contact'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full font-bold text-xs bg-[#FFC006] text-gray-950 hover:bg-[#E5AC00] transition-colors"
              >
                WhatsApp Us
              </a>
              <Link
                href="/terms"
                className="px-4 py-2 rounded-full font-bold text-xs bg-gray-900 text-white hover:bg-black transition-colors"
              >
                View All Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
