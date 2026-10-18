import { ShieldCheck, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions - FunPrint',
  description: 'Terms and conditions, refund and exchange policy for FunPrint (OSHIVO EXIM OPC PVT LTD)',
};

export default function Terms() {
  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 bg-slate-50/70 font-serif">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-xs space-y-8">
          {/* Header */}
          <div className="border-b border-gray-100 pb-6">
            <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 inline-block mb-3">
              Official Legal Terms & Policy
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mb-2">
              Terms and Conditions
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Welcome to FunPrint (OSHIVO EXIM OPC PVT LTD)! By accessing or using this website, you agree to abide by the following Terms and Conditions. Please read them carefully before placing your order.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Product Offerings</span>
            </h2>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed pl-8">
              <p>
                <strong className="text-gray-950">Plain T-shirts:</strong> FunPrint offers a wide range of plain t-shirts available for individual purchase. These products are delivered within a maximum of 3 business days from the date of order confirmation.
              </p>
              <p>
                <strong className="text-gray-950">Custom Bulk Orders for Events or Employees:</strong> Customers can submit a WhatsApp enquiry through the website for bulk orders of custom t-shirts for events, corporate uniforms, or other purposes. Customization services are available, and specific terms for bulk orders will be discussed and agreed upon during the enquiry process.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Custom Orders</span>
            </h2>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed pl-8">
              <p>
                <strong className="text-gray-950">Customized T-shirts (Bulk Orders):</strong> Custom t-shirts that include logos, event names, or any other designs cannot be cancelled or refunded once the order is placed and the production process has started. This applies to all bulk orders that are confirmed for events, corporate needs, or personalized designs.
              </p>
              <p>
                Once the custom order is ready and dispatched, customers are required to pay the full amount as agreed during the ordering process. No changes or cancellations will be accepted after the production begins.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Order Processing and Delivery</span>
            </h2>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed pl-8">
              <p>
                <strong className="text-gray-950">Plain T-shirts:</strong> For plain t-shirts, orders will be processed and delivered within 3 business days from the time of order confirmation. If there are any unforeseen delays, we will promptly notify you.
              </p>
              <p>
                <strong className="text-gray-950">Bulk Orders (Custom T-shirts):</strong> Delivery timelines for bulk custom orders will be agreed upon during the enquiry process. The delivery time may vary based on the size of the order, customization requirements, and other factors.
              </p>
            </div>
          </section>

          {/* Refund and Exchange Policy */}
          <div className="border-t border-gray-100 pt-6 space-y-6">
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5">
              <h2 className="text-xl font-black text-amber-950 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-700" />
                <span>Refund and Exchange Policy</span>
              </h2>

              <div className="space-y-4 text-sm text-gray-800 leading-relaxed">
                <div>
                  <h3 className="font-bold text-gray-950 mb-1">Refund Policy</h3>
                  <p className="mb-2">
                    <strong className="text-gray-950">Plain T-shirts:</strong> Refunds will only be granted if the product is found to be damaged upon delivery, or if the courier package is tampered with. In such cases, customers must provide a video of the package being opened as evidence to claim a refund. Without this video proof, refund requests will not be entertained.
                  </p>
                  <p>
                    <strong className="text-gray-950">Custom T-shirts (Bulk Orders):</strong> Custom bulk orders are non-refundable and non-cancellable once production has begun, as these products are specially made for you and cannot be resold.
                  </p>
                </div>

                <div className="pt-2">
                  <h3 className="font-bold text-gray-950 mb-1">Exchange Policy</h3>
                  <p>
                    <strong className="text-gray-950">Size Exchanges (Plain T-shirts Only):</strong> If you find that the size of a plain t-shirt does not fit, we offer an exchange for a different size. No refunds will be provided in case of size issues, and exchanges are subject to the availability of stock.
                  </p>
                </div>
              </div>
            </div>

            {/* Cancellations */}
            <div id="cancellations" className="space-y-3">
              <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">4</span>
                <span>Cancellations</span>
              </h2>
              <div className="space-y-2 text-sm text-gray-700 leading-relaxed pl-8">
                <p>
                  <strong className="text-gray-950">Plain T-shirts:</strong> Orders for plain t-shirts can be cancelled if the cancellation request is made before the order has been dispatched. Once the order has been dispatched, cancellations will not be accepted.
                </p>
                <p>
                  <strong className="text-gray-950">Custom Bulk Orders:</strong> Once the order for customized t-shirts has been placed and production has started, no cancellations will be allowed under any circumstances.
                </p>
              </div>
            </div>

            {/* Bulk Order Inquiries */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">5</span>
                <span>Bulk Order Inquiries</span>
              </h2>
              <div className="text-sm text-gray-700 leading-relaxed pl-8">
                <p>
                  For all bulk orders, including custom designs for events or corporate use, customers must submit an enquiry through WhatsApp. A representative from FunPrint will contact you with a formal quotation, including pricing, delivery timelines, and customization details. Once the order is confirmed, no changes will be accepted unless agreed upon prior to the start of production.
                </p>
              </div>
            </div>

            {/* Claims for Damaged Products */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-bold">6</span>
                <span>Claims for Damaged Products</span>
              </h2>
              <div className="space-y-2 text-sm text-gray-700 leading-relaxed pl-8">
                <p>
                  In the case of a damaged product or tampered courier packaging, customers must provide a video of the package being opened to initiate a refund or replacement request. Claims without proper evidence will not be entertained.
                </p>
                <p>
                  Refunds will only be processed if the product damage is confirmed. Customers may also choose to receive a replacement instead of a refund, subject to product availability.
                </p>
              </div>
            </div>

            {/* Closing note */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-600 leading-relaxed">
              <p className="mb-2">
                By using the FunPrint website and placing an order, you acknowledge and agree to these Terms and Conditions. FunPrint reserves the right to update or modify these policies at any time without prior notice.
              </p>
              <p>
                For questions or assistance, contact our team at{' '}
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@funprint.in'}`}
                  className="font-bold text-gray-900 hover:underline"
                >
                  {process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@funprint.in'}
                </a>
                {(process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) && (
                  <>
                    {' '}or call / WhatsApp{' '}
                    <a
                      href={`tel:+${(process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '')}`}
                      className="font-bold text-gray-900 hover:underline"
                    >
                      +{(process.env.NEXT_PUBLIC_PHONE_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '')}
                    </a>
                  </>
                )}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
