'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const sizeData = [
  { size: 'S', chest: '36-38', length: '26', shoulder: '16' },
  { size: 'M', chest: '38-40', length: '27', shoulder: '17' },
  { size: 'L', chest: '40-42', length: '28', shoulder: '18' },
  { size: 'XL', chest: '42-44', length: '29', shoulder: '19' },
  { size: 'XXL', chest: '44-46', length: '30', shoulder: '20' },
];

export default function SizeGuide({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Size Guide</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">All measurements are in inches</p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4">Size</th>
                  <th className="text-left py-3 px-4">Chest</th>
                  <th className="text-left py-3 px-4">Length</th>
                  <th className="text-left py-3 px-4">Shoulder</th>
                </tr>
              </thead>
              <tbody>
                {sizeData.map((row) => (
                  <tr key={row.size} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-semibold">{row.size}</td>
                    <td className="py-3 px-4">{row.chest}"</td>
                    <td className="py-3 px-4">{row.length}"</td>
                    <td className="py-3 px-4">{row.shoulder}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-brand-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Measurements may vary by ±1 inch. For best fit, 
              measure your favorite t-shirt and compare with our size chart.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
