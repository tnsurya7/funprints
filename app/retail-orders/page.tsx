'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  MessageCircle, 
  Shirt, 
  Check, 
  Sparkles,
  X,
  Minus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllEnhancedProducts, EnhancedProduct } from '@/lib/enhanced-products';
import { getColorDisplay } from '@/lib/colors';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  color: string;
  sizeQuantities: Record<string, number>; // e.g. { S: 2, M: 5, L: 10 }
  totalQuantity: number;
  logoPlacement: string;
  image?: string;
}

const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

const LOGO_PLACEMENTS = [
  'Left Chest Logo',
  'Center Front Logo',
  'Full Back Print',
  'Left Chest + Full Back (Dual Print)',
  'Sleeve Logo',
];

export default function RetailOrdersPage() {
  const allCatalogProducts = getAllEnhancedProducts();

  // Active filter for garment selection cards (strictly without 'oversized')
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  
  // Track preview color for each card in the grid
  const [cardSelectedColors, setCardSelectedColors] = useState<Record<string, string>>({});

  // Active product selected for detailed modal customization
  const [activeModalProduct, setActiveModalProduct] = useState<EnhancedProduct | null>(null);
  const [modalColor, setModalColor] = useState<string>('Black');
  // Store size quantities per color: { [colorName]: { [size]: quantity } }
  const [modalColorSizeQuantities, setModalColorSizeQuantities] = useState<Record<string, Record<string, number>>>({});
  const [modalLogoPlacement, setModalLogoPlacement] = useState<string>('Left Chest Logo');

  // Customer's configured order items (defaults to 1 piece retail quantity, freely removable)
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 'item-1',
      productId: 'cotton-round-neck',
      productName: 'Cotton Supersoft Round Neck 180 GSM',
      category: 'Round Neck',
      color: 'Black',
      sizeQuantities: { M: 1 },
      totalQuantity: 1,
      logoPlacement: 'Left Chest Logo',
      image: '/products/all tshirts/360/products - online/Cotton Supersoft Round Neck 180 GSM/Black/f.jpg',
    },
  ]);

  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered products list (Strictly Round Neck, Polos, Hoodies, All Garments)
  const filteredCatalogProducts = allCatalogProducts.filter((product) => {
    if (productCategoryFilter === 'all') return true;
    if (productCategoryFilter === 't-shirt') {
      return product.category.toLowerCase().includes('round') || product.category.toLowerCase().includes('dry');
    }
    if (productCategoryFilter === 'polo') {
      return product.category.toLowerCase().includes('polo');
    }
    if (productCategoryFilter === 'hoodie') {
      return product.category.toLowerCase().includes('hoodie') || product.category.toLowerCase().includes('sweatshirt');
    }
    return true;
  });

  // Handle color change on a card preview
  const handleCardColorSelect = (productId: string, color: string) => {
    setCardSelectedColors((prev) => ({ ...prev, [productId]: color }));
  };

  // Open detailed customizer modal for a product
  const handleOpenCustomizer = (product: EnhancedProduct) => {
    const selectedColor = cardSelectedColors[product.id] || product.colors[0] || 'Black';
    setActiveModalProduct(product);
    setModalColor(selectedColor);
    setModalColorSizeQuantities({
      [selectedColor]: {
        S: 0,
        M: 1,
        L: 0,
        XL: 0,
        '2XL': 0,
        '3XL': 0,
      },
    });
    setModalLogoPlacement('Left Chest Logo');
  };

  // Switch color inside customizer modal without resetting other colors
  const handleSelectModalColor = (clr: string) => {
    setModalColor(clr);
    setModalColorSizeQuantities((prev) => {
      if (prev[clr]) return prev;
      return {
        ...prev,
        [clr]: {
          S: 0,
          M: 0,
          L: 0,
          XL: 0,
          '2XL': 0,
          '3XL': 0,
        },
      };
    });
  };

  // Update quantity for a specific size in the active color
  const handleSizeQtyChange = (sz: string, newQty: number) => {
    const safeQty = Math.max(0, newQty);
    setModalColorSizeQuantities((prev) => ({
      ...prev,
      [modalColor]: {
        ...(prev[modalColor] || {}),
        [sz]: safeQty,
      },
    }));
  };

  // Helper to get total pieces across all configured colors in the modal
  const getModalTotalPieces = () => {
    let total = 0;
    Object.values(modalColorSizeQuantities).forEach((sizes) => {
      Object.values(sizes || {}).forEach((q) => {
        total += (q || 0);
      });
    });
    return total;
  };

  // Helper to get total pieces for a single color in the modal
  const getColorTotalPieces = (clr: string) => {
    return Object.values(modalColorSizeQuantities[clr] || {}).reduce((a, b) => a + (b || 0), 0);
  };

  // Add customized item(s) from modal into order across all selected colors
  const handleAddCustomizedItem = () => {
    if (!activeModalProduct) return;

    const newItems: OrderItem[] = [];

    Object.entries(modalColorSizeQuantities).forEach(([clr, sizeMap]) => {
      const activeSizes: Record<string, number> = {};
      let colorTotal = 0;
      Object.entries(sizeMap || {}).forEach(([sz, qty]) => {
        if (qty > 0) {
          activeSizes[sz] = qty;
          colorTotal += qty;
        }
      });

      if (colorTotal > 0) {
        const productImage =
          activeModalProduct.images[clr]?.front ||
          activeModalProduct.images[activeModalProduct.colors[0]]?.front ||
          '/placeholder-image.jpg';

        newItems.push({
          id: `item-${Date.now()}-${clr.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          productId: activeModalProduct.id,
          productName: activeModalProduct.name,
          category: activeModalProduct.category,
          color: clr,
          sizeQuantities: activeSizes,
          totalQuantity: colorTotal,
          logoPlacement: modalLogoPlacement,
          image: productImage,
        });
      }
    });

    if (newItems.length === 0) {
      toast.error('Please specify a quantity for at least one size');
      return;
    }

    setItems((prev) => [...prev, ...newItems]);
    const totalPieces = newItems.reduce((acc, it) => acc + it.totalQuantity, 0);
    const colorSummary = newItems.map((it) => `${it.color} (${it.totalQuantity})`).join(', ');
    toast.success(
      `Added ${totalPieces} pcs (${activeModalProduct.name}: ${colorSummary}) to your retail order!`
    );
    setActiveModalProduct(null);
  };

  // Remove an item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalQuantity = items.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);

  // Submit via API (stores in Neon DB, emails receiver + both admins) and opens WhatsApp
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0 || totalQuantity <= 0) {
      toast.error('Please configure and add at least 1 garment to your retail order');
      return;
    }

    if (!customerName.trim() || !mobile.trim()) {
      toast.error('Please enter your full name and phone number');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address to receive your order confirmation');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit to API endpoint (persists to Neon DB retail_enquiries & triggers emails to customer + admins)
      const res = await fetch('/api/retail-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
          items: items.map((it) => ({
            garment: it.category,
            style: it.productName,
            color: it.color,
            sizesSummary: Object.entries(it.sizeQuantities)
              .map(([sz, qty]) => `${sz}:${qty}`)
              .join(', '),
            quantity: it.totalQuantity,
            logoPlacement: it.logoPlacement,
          })),
          notes: notes.trim(),
          totalQuantity,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit order request');
      }

      toast.success('Custom order submitted! Confirmation email sent to your inbox.');

      // 2. Open WhatsApp for instant logo sharing
      const itemsSummary = items
        .map((it, idx) => {
          const sizeBreakdown = Object.entries(it.sizeQuantities)
            .map(([sz, q]) => `${q}x Size ${sz}`)
            .join(', ');
          return `${idx + 1}. ${it.totalQuantity}x ${it.productName} - Color: ${it.color} [${sizeBreakdown}] (${it.logoPlacement})`;
        })
        .join('\n');

      const orderText = `Hi FunPrint, I want to place a Customized Logo Order:
Total Items: ${totalQuantity} Pieces

Items Breakdown:
${itemsSummary}

Customer Details:
Name: ${customerName}
Mobile: ${mobile}
Email: ${email}
Logo Instructions: ${notes || 'Ready to send logo file'}`;

      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
      if (whatsappNumber) {
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(orderText)}`;
        window.open(whatsappUrl, '_blank');
      }
    } catch (err: any) {
      console.error('Retail order submission error:', err);
      toast.error(err.message || 'Error submitting order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 bg-slate-50/70 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Direct Factory Custom Printing &amp; Embroidery</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight mb-3">
            Custom Logo T-Shirts, Polos &amp; Hoodies
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Select any garment card below to view details and select your colors, sizes, quantities, and custom logo placements.
          </p>
        </div>

        {/* SECTION 1: PRODUCT IMAGE CARDS GALLERY (STRICTLY NO PRICES) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2">
                <Shirt className="w-6 h-6 text-[#FFC006]" />
                <span>Select Garments for Retail Customization</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Choose your apparel style below to configure colors, sizes, and custom logo placements.
              </p>
            </div>

            {/* Filter Pills - Removed Oversized Option */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none items-center">
              {[
                { id: 'all', label: 'All Garments' },
                { id: 't-shirt', label: 'Round Neck' },
                { id: 'polo', label: 'Polos' },
                { id: 'hoodie', label: 'Hoodies' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setProductCategoryFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    productCategoryFilter === f.id
                      ? 'bg-[#FFC006] text-gray-950 shadow-xs border border-amber-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid - STRICTLY NO PRICES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredCatalogProducts.map((product) => {
              const activeColor = cardSelectedColors[product.id] || product.colors[0] || 'Black';
              const activeImage = product.images[activeColor]?.front || product.images[product.colors[0]]?.front || '/placeholder-image.jpg';
              const displayedColors = product.colors.slice(0, 6);
              const extraColorsCount = product.colors.length - 6;

              return (
                <div
                  key={product.id}
                  onClick={() => handleOpenCustomizer(product)}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-gray-950 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group relative cursor-pointer"
                >
                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-gray-900 text-[10px] font-bold border border-gray-200 shadow-xs">
                      {product.category}
                    </span>
                    {product.gsm && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-extrabold border border-amber-200 shadow-xs">
                        {product.gsm} GSM
                      </span>
                    )}
                  </div>

                  {/* Product Image Frame */}
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-3">
                    <Image
                      src={activeImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Content (STRICTLY NO PRICES SHOWN) */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-gray-950 line-clamp-2 leading-tight mb-2">
                        {product.name}
                      </h3>

                      {/* Color Preview Swatches */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-500 font-medium">
                            Color: <strong className="text-gray-900">{activeColor}</strong>
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {product.colors.length} shades
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap items-center">
                          {displayedColors.map((clr) => {
                            const isColorActive = clr === activeColor;
                            return (
                              <button
                                key={clr}
                                type="button"
                                title={`Preview ${clr}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCardColorSelect(product.id, clr);
                                }}
                                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                  isColorActive
                                    ? 'ring-2 ring-gray-950 ring-offset-1 scale-110 border-white'
                                    : 'border-gray-300 hover:scale-105'
                                }`}
                                style={{ backgroundColor: getColorDisplay(clr) }}
                              />
                            );
                          })}
                          {extraColorsCount > 0 && (
                            <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1 py-0.5 rounded-full">
                              +{extraColorsCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Open Detailed Customizer View */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCustomizer(product);
                      }}
                      className="w-full py-2 rounded-full font-bold text-xs bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 border border-amber-400/70 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Customize &amp; Order</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: CONFIGURED ITEMS & SUBMISSION FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT: Configured Items List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-gray-950">
                    Your Configured Custom Garments ({items.length})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Click any product card above to add another style, color, or size combination
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-black border border-amber-300">
                  {totalQuantity} {totalQuantity === 1 ? 'Unit' : 'Units'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 pt-4">
                {items.length === 0 ? (
                  <div className="py-8 text-center bg-stone-50 rounded-2xl border border-dashed border-gray-300">
                    <Shirt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-700">No garments selected yet</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Choose any garment above and click &ldquo;Customize &amp; Order&rdquo; to add to your order.
                    </p>
                  </div>
                ) : (
                  items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-gray-200 bg-stone-50/70 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
                          {item.image ? (
                            <img src={item.image} alt={item.productName} className="w-full h-full object-contain" />
                          ) : (
                            <Shirt className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-gray-950">{item.productName}</span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-gray-800">
                              {item.color}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-1">
                            Sizes: <strong className="text-gray-900 font-mono">
                              {Object.entries(item.sizeQuantities).map(([sz, q]) => `${q}x ${sz}`).join(', ')}
                            </strong>
                          </p>
                          <p className="text-[11px] text-amber-800 mt-0.5 font-medium">
                            Print: {item.logoPlacement}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                        <span className="px-2.5 py-1 rounded-full bg-white border border-gray-200 font-black text-gray-950 text-xs">
                          {item.totalQuantity} {item.totalQuantity === 1 ? 'pc' : 'pcs'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove garment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary & Checkout Form */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-baseline justify-between pb-3 border-b border-gray-100">
                <h3 className="font-extrabold text-lg text-gray-950">Order Request Details</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                  {totalQuantity} {totalQuantity === 1 ? 'Piece' : 'Pieces'}
                </span>
              </div>

              {/* Customer Contact & Submission */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Surya Kumar"
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-gray-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit WhatsApp number"
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-gray-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="surya@gmail.com"
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-gray-950"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Order confirmation and design proofs will be sent directly to this email.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Logo / Design Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specify logo placements, printing type (Screen / DTF / Embroidery), or special instructions..."
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs resize-none outline-none focus:ring-2 focus:ring-gray-950"
                  />
                </div>

                {/* Primary Curvly CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-3.5 rounded-full font-black bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 shadow-xs hover:shadow transition-all border border-amber-400/60 flex items-center justify-center gap-2 text-xs sm:text-sm mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>
                    {isSubmitting
                      ? 'Submitting Custom Order...'
                      : `Submit Custom Order (${totalQuantity} Pieces)`}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* DETAILED PRODUCT CUSTOMIZATION MODAL */}
        <AnimatePresence>
          {activeModalProduct && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 sm:p-7 relative text-xs"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveModalProduct(null)}
                  className="absolute top-5 right-5 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Header */}
                <div className="pb-4 border-b border-gray-100 pr-8">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                    {activeModalProduct.category} {activeModalProduct.gsm ? `• ${activeModalProduct.gsm} GSM` : ''}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-gray-950 mt-1">
                    {activeModalProduct.name}
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Select your apparel color, choose quantities for each size, and pick logo placement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 py-5">
                  {/* Left: Image Preview in Selected Color */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center bg-stone-50 rounded-2xl p-4 border border-gray-200 aspect-square relative">
                    <img
                      src={
                        activeModalProduct.images[modalColor]?.front ||
                        activeModalProduct.images[activeModalProduct.colors[0]]?.front ||
                        '/placeholder-image.jpg'
                      }
                      alt={activeModalProduct.name}
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute bottom-2 px-2.5 py-0.5 rounded-full bg-white/90 border border-gray-200 text-[10px] font-bold text-gray-900 shadow-2xs">
                      Color: {modalColor}
                    </span>
                  </div>

                  {/* Right: Colors, Sizes Matrix & Logo Placement */}
                  <div className="sm:col-span-7 space-y-4">
                    {/* 1. Color Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700">
                          Choose Garment Color ({activeModalProduct.colors.length} Available)
                        </label>
                        <span className="text-[10px] text-gray-500 font-medium">
                          Select color &amp; set sizes below
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap items-center">
                        {activeModalProduct.colors.map((clr) => {
                          const isClrActive = clr === modalColor;
                          const hex = getColorDisplay(clr);
                          const isWhite = clr.toLowerCase().includes('white') || hex.toLowerCase() === '#ffffff';
                          const colorPieces = getColorTotalPieces(clr);
                          return (
                            <button
                              key={clr}
                              type="button"
                              onClick={() => handleSelectModalColor(clr)}
                              title={clr}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                                isClrActive
                                  ? 'border-gray-950 bg-gray-950 text-white shadow-xs'
                                  : colorPieces > 0
                                  ? 'border-amber-400 bg-amber-50/70 text-gray-900 hover:border-amber-500'
                                  : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                              }`}
                            >
                              <span
                                className={`w-3 h-3 rounded-full shrink-0 ${isWhite ? 'border border-gray-300' : ''}`}
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-[11px]">{clr}</span>
                              {colorPieces > 0 && (
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                                    isClrActive ? 'bg-[#FFC006] text-gray-950' : 'bg-amber-400 text-gray-950'
                                  }`}
                                >
                                  {colorPieces}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Multi-Size Quantities Matrix for Active Color */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700">
                          Sizes for <span className="underline decoration-amber-400 font-extrabold">{modalColor}</span> (Pieces)
                        </label>
                        <span className="text-[11px] font-bold text-amber-900">
                          {modalColor}: {getColorTotalPieces(modalColor)} pcs
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {SIZES.map((sz) => {
                          const activeSizes = modalColorSizeQuantities[modalColor] || {};
                          const currentQty = activeSizes[sz] || 0;
                          return (
                            <div
                              key={sz}
                              className="p-2 rounded-xl border border-gray-200 bg-stone-50/60 flex flex-col items-center justify-between gap-1"
                            >
                              <span className="font-extrabold text-[11px] text-gray-900 font-mono">{sz}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSizeQtyChange(sz, currentQty - 1)}
                                  className="w-5 h-5 rounded-md bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-xs"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={currentQty}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    handleSizeQtyChange(sz, val);
                                  }}
                                  className="w-10 py-0.5 text-center bg-white border border-gray-300 rounded text-xs font-black outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSizeQtyChange(sz, currentQty + 1)}
                                  className="w-5 h-5 rounded-md bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary of all configured colors in this modal */}
                    {getModalTotalPieces() > 0 && (
                      <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">
                            Colors Configured for this Garment
                          </span>
                          <span className="text-[11px] font-extrabold text-amber-950">
                            Combined Total: {getModalTotalPieces()} pcs
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(modalColorSizeQuantities).map(([cName, sMap]) => {
                            const cTotal = Object.values(sMap || {}).reduce((a, b) => a + (b || 0), 0);
                            if (cTotal <= 0) return null;
                            const isCurrent = modalColor === cName;
                            const breakdown = Object.entries(sMap)
                              .filter(([_, q]) => q > 0)
                              .map(([s, q]) => `${s}:${q}`)
                              .join(' ');
                            return (
                              <button
                                key={cName}
                                type="button"
                                onClick={() => handleSelectModalColor(cName)}
                                className={`px-2 py-0.5 rounded-xl text-[10px] font-bold border flex items-center gap-1.5 transition-all ${
                                  isCurrent
                                    ? 'bg-gray-950 text-white border-gray-950 shadow-xs'
                                    : 'bg-white text-gray-800 border-amber-300 hover:bg-amber-100'
                                }`}
                                title="Click to view/edit sizes for this color"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: getColorDisplay(cName) }}
                                />
                                <span>{cName}: <strong>{cTotal} pcs</strong></span>
                                <span className="opacity-75 text-[9px]">({breakdown})</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 3. Logo Placement */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 mb-1.5">
                        Logo / Artwork Placement
                      </label>
                      <select
                        value={modalLogoPlacement}
                        onChange={(e) => setModalLogoPlacement(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-white outline-none focus:border-[#FFC006]"
                      >
                        {LOGO_PLACEMENTS.map((lp) => (
                          <option key={lp} value={lp}>
                            {lp}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveModalProduct(null)}
                    className="px-4 py-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomizedItem}
                    className="px-5 py-2 rounded-full bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 font-black shadow-xs border border-amber-400/60 transition-all hover:scale-[1.01]"
                  >
                    Add to Retail Order ({getModalTotalPieces()} Pieces)
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
