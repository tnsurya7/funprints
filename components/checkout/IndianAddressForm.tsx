'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface PostOffice {
  Name: string;
  Description: string | null;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  Block: string;
  State: string;
  Country: string;
  Pincode: string;
}

interface PincodeAPIResponse {
  Message: string;
  Status: string;
  PostOffice: PostOffice[] | null;
}

interface AddressFormData {
  pincode: string;
  state: string;
  district: string;
  city: string;
  buildingNumber: string;
  landmark: string;
}

interface IndianAddressFormProps {
  formData: AddressFormData;
  onChange: (data: Partial<AddressFormData>) => void;
  errors?: Partial<Record<keyof AddressFormData, string>>;
}

export default function IndianAddressForm({ formData, onChange, errors = {} }: IndianAddressFormProps) {
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'success' | 'error' | 'not-found'>('idle');
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Auto-fill logic when pincode changes
  useEffect(() => {
    if (formData.pincode.length === 6 && /^\d{6}$/.test(formData.pincode)) {
      fetchPincodeData(formData.pincode);
    } else if (formData.pincode.length < 6) {
      // Reset when pincode is cleared or incomplete
      setPincodeStatus('idle');
      setPostOffices([]);
      setIsManualEntry(false);
      if (formData.pincode.length === 0) {
        onChange({
          state: '',
          district: '',
          city: '',
        });
      }
    }
  }, [formData.pincode]);

  const fetchPincodeData = async (pincode: string) => {
    setIsLoadingPincode(true);
    setPincodeStatus('idle');
    setPostOffices([]);
    setIsManualEntry(false);

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data: PincodeAPIResponse[] = await response.json();

      if (data[0]?.Status === 'Success' && data[0]?.PostOffice && data[0].PostOffice.length > 0) {
        const offices = data[0].PostOffice;
        setPostOffices(offices);
        setPincodeStatus('success');

        // Auto-fill State and District (always from first post office)
        onChange({
          state: offices[0].State,
          district: offices[0].District,
        });

        // City / Area logic
        if (offices.length === 1) {
          // Single post office → auto-fill city
          onChange({
            state: offices[0].State,
            district: offices[0].District,
            city: offices[0].Name,
          });
          toast.success('Address details auto-filled!');
        } else {
          // Multiple post offices → show dropdown
          onChange({
            state: offices[0].State,
            district: offices[0].District,
            city: '', // Clear city to force selection
          });
          setShowCityDropdown(true);
          toast.success(`Found ${offices.length} areas for this PIN code`);
        }
      } else {
        // PIN code not found
        setPincodeStatus('not-found');
        setIsManualEntry(true);
        toast.error('PIN code not found. Please enter address manually.');
      }
    } catch (error) {
      console.error('Pincode lookup error:', error);
      setPincodeStatus('error');
      setIsManualEntry(true);
      toast.error('Could not fetch address details. Please enter manually.');
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange({ pincode: value });
  };

  const handleCitySelect = (cityName: string) => {
    onChange({ city: cityName });
    setShowCityDropdown(false);
  };

  const isFieldDisabled = (field: 'state' | 'district' | 'city') => {
    if (isManualEntry) return false;
    if (pincodeStatus !== 'success') return false;
    
    // State and District are always disabled when auto-filled
    if (field === 'state' || field === 'district') return true;
    
    // City is disabled only if single post office (auto-filled)
    if (field === 'city' && postOffices.length === 1) return true;
    
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Delivery Address</h3>
          <p className="text-sm text-gray-600">Enter your PIN code for auto-fill</p>
        </div>
      </div>

      {/* PIN Code Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          PIN Code <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.pincode}
            onChange={handlePincodeChange}
            placeholder="Enter 6-digit PIN code"
            maxLength={6}
            className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 ${
              errors.pincode
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : pincodeStatus === 'success'
                ? 'border-green-500 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                : pincodeStatus === 'not-found' || pincodeStatus === 'error'
                ? 'border-orange-500 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
            } outline-none`}
          />
          
          {/* Status Icons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <AnimatePresence mode="wait">
              {isLoadingPincode && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                </motion.div>
              )}
              {pincodeStatus === 'success' && !isLoadingPincode && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </motion.div>
              )}
              {(pincodeStatus === 'not-found' || pincodeStatus === 'error') && !isLoadingPincode && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {errors.pincode && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.pincode}
          </motion.p>
        )}

        {/* Status Messages */}
        <AnimatePresence>
          {pincodeStatus === 'not-found' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <p className="text-sm text-orange-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>PIN code not found. Please enter address manually.</span>
              </p>
            </motion.div>
          )}
          {pincodeStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <p className="text-sm text-orange-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Network error. Please enter address manually.</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* State and District - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* State */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => onChange({ state: e.target.value })}
            disabled={isFieldDisabled('state')}
            placeholder={isManualEntry ? 'Enter state' : 'Auto-filled from PIN'}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none ${
              isFieldDisabled('state')
                ? 'bg-green-50 border-green-300 text-gray-700 cursor-not-allowed'
                : errors.state
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
            }`}
          />
          {errors.state && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.state}
            </p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            District <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => onChange({ district: e.target.value })}
            disabled={isFieldDisabled('district')}
            placeholder={isManualEntry ? 'Enter district' : 'Auto-filled from PIN'}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none ${
              isFieldDisabled('district')
                ? 'bg-green-50 border-green-300 text-gray-700 cursor-not-allowed'
                : errors.district
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
            }`}
          />
          {errors.district && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.district}
            </p>
          )}
        </div>
      </div>

      {/* City / Area */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          City / Area <span className="text-red-500">*</span>
        </label>
        
        {postOffices.length > 1 && !isManualEntry ? (
          // Dropdown for multiple post offices
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none text-left flex items-center justify-between ${
                errors.city
                  ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
              }`}
            >
              <span className={formData.city ? 'text-gray-900' : 'text-gray-500'}>
                {formData.city || 'Select your area'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showCityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                >
                  {postOffices.map((office, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCitySelect(office.Name)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{office.Name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {office.BranchType} • {office.DeliveryStatus}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // Regular input for single post office or manual entry
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onChange({ city: e.target.value })}
            disabled={isFieldDisabled('city')}
            placeholder={isManualEntry ? 'Enter city/area' : 'Auto-filled from PIN'}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none ${
              isFieldDisabled('city')
                ? 'bg-green-50 border-green-300 text-gray-700 cursor-not-allowed'
                : errors.city
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
            }`}
          />
        )}
        
        {errors.city && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.city}
          </p>
        )}
      </div>

      {/* Building Number / Street */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Building Number / Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.buildingNumber}
          onChange={(e) => onChange({ buildingNumber: e.target.value })}
          placeholder="House/Flat No., Building Name, Street"
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 outline-none ${
            errors.buildingNumber
              ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
          }`}
        />
        {errors.buildingNumber && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.buildingNumber}
          </p>
        )}
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Landmark <span className="text-gray-500 text-xs">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.landmark}
          onChange={(e) => onChange({ landmark: e.target.value })}
          placeholder="Near XYZ Mall, Opposite ABC School"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
        />
      </div>

      {/* Info Box */}
      {pincodeStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">Address Verified</p>
              <p className="text-xs text-green-700">
                {postOffices.length === 1 
                  ? 'All address fields have been auto-filled based on your PIN code.'
                  : `Found ${postOffices.length} areas. Please select your specific area from the dropdown.`
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
