'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Copy, MessageCircle, ArrowRight, Shirt, Layers, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  garment: 'T-Shirt' | 'Hoodie' | 'Pullover';
  style: string;
  color: string;
  size: string;
  quantity: number;
  logoPlacement: string;
}

const STYLES_BY_GARMENT = {
  'T-Shirt': [
    'Classic Round Neck (180 GSM Bio-Washed Cotton)',
    'Aero Polo T-Shirt (240 GSM Combed Cotton)',
    'Oversized Drop-Shoulder Tee (220 GSM)',
    'Dry-Fit Performance Aerotech Tee (200 GSM)',
  ],
  'Hoodie': [
    'Pullover Fleece Hoodie with Front Pocket (300 GSM)',
    'Full-Zip Heavyweight Fleece Hoodie (300 GSM)',
  ],
  'Pullover': [
    'Classic Crewneck Pullover Sweatshirt (280 GSM)',
  ],
};

const ALL_STYLES = [
  'Classic Round Neck (180 GSM Bio-Washed Cotton)',
  'Aero Polo T-Shirt (240 GSM Combed Cotton)',
  'Oversized Drop-Shoulder Tee (220 GSM)',
  'Dry-Fit Performance Aerotech Tee (200 GSM)',
  'Pullover Fleece Hoodie with Front Pocket (300 GSM)',
  'Full-Zip Heavyweight Fleece Hoodie (300 GSM)',
  'Classic Crewneck Pullover Sweatshirt (280 GSM)',
];

const COLORS = [
  { name: 'Red', hex: '#DC2626' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Burgundy', hex: '#831843' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Bottle Green', hex: '#064E3B' },
  { name: 'Dark Orange', hex: '#EA580C' },
];

const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

const LOGO_PLACEMENTS = [
  'Left Chest Logo',
  'Center Front Logo',
  'Full Back Print',
  'Left Chest + Full Back (Dual Print)',
  'Sleeve Logo',
];

export default function RetailOrdersPage() {
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: 'item-1',
      garment: 'T-Shirt',
      style: 'Classic Round Neck (180 GSM Bio-Washed Cotton)',
      color: 'Red',
      size: 'L',
      quantity: 10,
      logoPlacement: 'Left Chest Logo',
    },
    {
      id: 'item-2',
      garment: 'T-Shirt',
      style: 'Classic Round Neck (180 GSM Bio-Washed Cotton)',
      color: 'Yellow',
      size: 'M',
      quantity: 10,
      logoPlacement: 'Left Chest Logo',
    },
  ]);

  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [notes, setNotes] = useState('');

  // Add new blank item
  const handleAddItem = (garment: 'T-Shirt' | 'Hoodie' | 'Pullover' = 'T-Shirt') => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      garment,
      style: STYLES_BY_GARMENT[garment][0],
      color: 'Black',
      size: 'L',
      quantity: 10,
      logoPlacement: 'Left Chest Logo',
    };
    setItems([...items, newItem]);
    toast.success(`Added new ${garment} to your order!`);
  };

  // Duplicate an item
  const handleDuplicateItem = (itemToClone: OrderItem) => {
    const cloned: OrderItem = {
      ...itemToClone,
      id: `item-${Date.now()}`,
    };
    setItems([...items, cloned]);
    toast.success('Item duplicated. You can now change its color or size!');
  };

  // Remove an item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      toast.error('You must keep at least 1 item in your order');
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  // Update specific field on an item
  const handleUpdateItem = <K extends keyof OrderItem>(id: string, field: K, value: OrderItem[K]) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // If garment changed, auto-select first matching style
          if (field === 'garment') {
            const g = value as 'T-Shirt' | 'Hoodie' | 'Pullover';
            updated.style = STYLES_BY_GARMENT[g][0];
          }
          return updated;
        }
        return item;
      })
    );
  };

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Submit via WhatsApp
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !mobile.trim()) {
      toast.error('Please enter your name and phone number');
      return;
    }

    const itemsSummary = items
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.quantity}x ${it.style} - Color: ${it.color} - Size: ${it.size} (${it.logoPlacement})`
      )
      .join('\n');

    const orderText = `Hi FunPrint, I want to place a Customized Logo Order:
Total Items: ${totalQuantity} Pieces

Items Breakdown:
${itemsSummary}

Customer Details:
• Name: ${customerName}
• Mobile: ${mobile}
• Logo Instructions: ${notes || 'Ready to send logo file'}`;

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919344925600';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderText)}`;

    toast.success('Order summary generated! Opening WhatsApp to share your logo.');
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 bg-slate-50/70 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight mb-3">
            Customized Logo T-Shirts & Hoodies
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Mix and match your order freely! Choose 10 red T-shirts, 10 yellow T-shirts, 10 pullover hoodies, or any combination of styles, sizes, and colors with your custom printed logo.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: Multi-Item Customizer */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Add Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-950">Add Garments to Your Order:</h3>
                <p className="text-xs text-gray-500">Add multiple colors, sizes, and apparel styles</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAddItem('T-Shirt')}
                  className="px-4 py-2 rounded-full font-bold text-xs bg-gray-900 text-white hover:bg-black transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add T-Shirt</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddItem('Hoodie')}
                  className="px-4 py-2 rounded-full font-bold text-xs bg-gray-900 text-white hover:bg-black transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Hoodie</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddItem('Pullover')}
                  className="px-4 py-2 rounded-full font-bold text-xs bg-gray-900 text-white hover:bg-black transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Pullover</span>
                </button>
              </div>
            </div>

            {/* List of Custom Items */}
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-5 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-4 relative"
                  >
                    {/* Item Card Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-extrabold text-sm sm:text-base text-gray-950">
                          {item.quantity}x {item.color} {item.garment} (Size {item.size})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(item)}
                          title="Duplicate item to pick another color or size"
                          className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Clone</span>
                        </button>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            title="Remove this item"
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Garment & Fabric Pattern Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                          Garment Type
                        </label>
                        <select
                          value={item.garment}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'garment', e.target.value as OrderItem['garment'])
                          }
                          className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs sm:text-sm font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-gray-950"
                        >
                          <option value="T-Shirt">T-Shirt</option>
                          <option value="Hoodie">Hoodie (300 GSM)</option>
                          <option value="Pullover">Pullover Sweatshirt</option>
                        </select>
                      </div>

                      <div className="sm:col-span-8">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                          Fabric & Style Specification
                        </label>
                        <select
                          value={item.style}
                          onChange={(e) => handleUpdateItem(item.id, 'style', e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs sm:text-sm font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-gray-950"
                        >
                          {STYLES_BY_GARMENT[item.garment].map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                          Selected Color: <strong className="text-gray-950">{item.color}</strong>
                        </label>
                      </div>

                      <div className="flex gap-2 flex-wrap items-center">
                        {COLORS.map((c) => {
                          const isSelected = item.color === c.name;
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => handleUpdateItem(item.id, 'color', c.name)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'border-gray-950 bg-gray-950 text-white shadow-xs'
                                  : 'border-gray-200 hover:border-gray-400 bg-white text-gray-700'
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span>{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Size, Quantity & Logo Placement Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                      {/* Size */}
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                          Size ({item.size})
                        </label>
                        <div className="flex gap-1.5 flex-wrap">
                          {SIZES.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleUpdateItem(item.id, 'size', sz)}
                              className={`min-w-[36px] py-1.5 px-2.5 rounded-full border text-xs font-bold transition-all ${
                                item.size === sz
                                  ? 'border-gray-950 bg-gray-950 text-white'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5000"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-full p-2 border border-gray-300 rounded-2xl text-center text-sm font-bold bg-white text-gray-950 focus:ring-2 focus:ring-gray-950 outline-none"
                        />
                      </div>

                      {/* Logo Placement */}
                      <div className="sm:col-span-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                          Logo Placement
                        </label>
                        <select
                          value={item.logoPlacement}
                          onChange={(e) => handleUpdateItem(item.id, 'logoPlacement', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-2xl text-xs font-semibold bg-white text-gray-900 outline-none focus:ring-2 focus:ring-gray-950"
                        >
                          {LOGO_PLACEMENTS.map((lp) => (
                            <option key={lp} value={lp}>
                              {lp}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom Add Item Buttons */}
            <div className="p-4 bg-white rounded-3xl border border-gray-200 shadow-xs text-center flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-xs font-bold text-gray-700">Need more variations or styles?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAddItem('T-Shirt')}
                  className="px-5 py-2.5 rounded-full font-bold text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
                >
                  + Add Another T-Shirt
                </button>
                <button
                  type="button"
                  onClick={() => handleAddItem('Hoodie')}
                  className="px-5 py-2.5 rounded-full font-bold text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
                >
                  + Add Another Hoodie
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary & Checkout Form */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-baseline justify-between pb-3 border-b border-gray-100">
                <h3 className="font-extrabold text-lg text-gray-950">Order Summary</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                  {totalQuantity} Total Pieces
                </span>
              </div>

              {/* Items List Preview */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin text-xs">
                {items.map((it, idx) => (
                  <div
                    key={it.id}
                    className="p-2.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-gray-950">
                        {it.quantity}x {it.color} {it.garment}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Size {it.size} • {it.logoPlacement}
                      </p>
                    </div>
                    <span className="font-extrabold text-gray-800 text-xs">#{idx + 1}</span>
                  </div>
                ))}
              </div>

              {/* Customer Contact & Submission */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
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
                    placeholder="9876543210"
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-gray-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Logo / Design Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Logo details (e.g., HD DTF print on left chest, specific logo color, vector file ready)..."
                    className="w-full p-2.5 border border-gray-300 rounded-2xl text-xs resize-none outline-none focus:ring-2 focus:ring-gray-950"
                  />
                </div>

                {/* Primary Curvly CTA */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-full font-bold bg-[#FFC006] hover:bg-[#E5AC00] text-gray-950 shadow-xs hover:shadow transition-all border border-amber-400/60 flex items-center justify-center gap-2 text-sm sm:text-base mt-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Submit Custom Order ({totalQuantity} Pieces)</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
