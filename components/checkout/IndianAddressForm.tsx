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
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'success' | 'error' | 'not-found'>(() => {
    if (formData.pincode?.length === 6 && formData.state && formData.district) {
      return 'success';
    }
    return 'idle';
  });
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [lastFetchedPincode, setLastFetchedPincode] = useState(() => {
    return (formData.pincode?.length === 6 && formData.state) ? formData.pincode : '';
  });

  // Keep pincodeStatus synchronized if draft was restored with state & district
  useEffect(() => {
    if (formData.pincode?.length === 6 && formData.state && formData.district && pincodeStatus === 'idle') {
      setPincodeStatus('success');
      setLastFetchedPincode(formData.pincode);
    }
  }, [formData.pincode, formData.state, formData.district, pincodeStatus]);

  // Auto-fill logic when pincode changes
  useEffect(() => {
    if (formData.pincode.length === 6 && /^\d{6}$/.test(formData.pincode)) {
      if (formData.pincode !== lastFetchedPincode) {
        fetchPincodeData(formData.pincode);
      }
    } else if (formData.pincode.length < 6) {
      // Reset when pincode is cleared or incomplete
      setPincodeStatus('idle');
      setPostOffices([]);
      setIsManualEntry(false);
      setLastFetchedPincode('');
      if (formData.pincode.length === 0) {
        onChange({
          state: '',
          district: '',
          city: '',
        });
      }
    }
  }, [formData.pincode, lastFetchedPincode]);

  const fetchPincodeData = async (pincode: string) => {
    setIsLoadingPincode(true);
    setPincodeStatus('idle');
    setPostOffices([]);
    setIsManualEntry(false);
    setLastFetchedPincode(pincode);

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
          // Multiple post offices: preserve existing draft city if valid, else prompt selection
          const existingCity = formData.city;
          const matchingOffice = existingCity ? offices.find(o => o.Name.toLowerCase() === existingCity.toLowerCase()) : null;

          if (matchingOffice) {
            onChange({
              state: offices[0].State,
              district: offices[0].District,
              city: matchingOffice.Name,
            });
          } else if (!existingCity) {
            onChange({
              state: offices[0].State,
              district: offices[0].District,
              city: '',
            });
            setShowCityDropdown(true);
            toast.success(`Found ${offices.length} areas for PIN ${pincode}`);
          }
        }
      } else {
        // PIN code not found
        setPincodeStatus('not-found');
        setIsManualEntry(true);
        toast.error('PIN code not found. Please enter address manually.');
      }
    } catch (error) {
      console.error('Pincode lookup error:', error);
      // If we already have state & district from draft, keep them intact!
      if (formData.state && formData.district) {
        setPincodeStatus('success');
      } else {
        setPincodeStatus('error');
        setIsManualEntry(true);
        toast.error('Could not fetch address details. Please enter manually.');
      }
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
    
    // State and District are auto-filled from PIN
    if (field === 'state' || field === 'district') return true;
    
    // City / Area is always editable by the customer
    if (field === 'city') return false;
    
    return false;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200">
        <div className="p-2 sm:p-2.5 rounded-full bg-gray-900 text-white">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Delivery Address</h3>
          <p className="text-xs sm:text-sm text-gray-500">Enter your PIN code for auto-fill</p>
        </div>
      </div>

      {/* PIN Code Field */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5">
          PIN Code <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.pincode}
            onChange={handlePincodeChange}
            placeholder="Enter 6-digit PIN code"
            maxLength={6}
            className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 pr-10 sm:pr-12 border-2 rounded-xl transition-all duration-200 text-xs sm:text-sm ${
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
          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* State */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5">
            State <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => onChange({ state: e.target.value })}
            disabled={isFieldDisabled('state')}
            placeholder={isManualEntry ? 'Enter state' : 'Auto-filled from PIN'}
            className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border-2 rounded-xl transition-all duration-200 outline-none text-xs sm:text-sm ${
              isFieldDisabled('state')
                ? 'bg-green-50 border-green-300 text-gray-700 cursor-not-allowed'
                : errors.state
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
            }`}
          />
          {errors.state && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.state}
            </p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5">
            District <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => onChange({ district: e.target.value })}
            disabled={isFieldDisabled('district')}
            placeholder={isManualEntry ? 'Enter district' : 'Auto-filled from PIN'}
            className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border-2 rounded-xl transition-all duration-200 outline-none text-xs sm:text-sm ${
              isFieldDisabled('district')
                ? 'bg-green-50 border-green-300 text-gray-700 cursor-not-allowed'
                : errors.district
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
            }`}
          />
          {errors.district && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.district}
            </p>
          )}
        </div>
      </div>

      {/* City / Area - Fully Editable */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs sm:text-sm font-semibold text-gray-900">
            City / Area <span className="text-red-500">*</span>
          </label>
          {postOffices.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-purple-50"
            >
              <span>{showCityDropdown ? 'Close areas' : `Choose area (${postOffices.length})`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={formData.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Enter or edit city / area name"
            className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 ${postOffices.length > 0 ? 'pr-10' : ''} border-2 rounded-xl transition-all duration-200 outline-none text-xs sm:text-sm ${
              errors.city
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
            }`}
          />
          {postOffices.length > 0 && (
            <button
              type="button"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="View suggested postal areas"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
            </button>
          )}

          <AnimatePresence>
            {showCityDropdown && postOffices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute z-20 w-full mt-1.5 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-100"
              >
                <div className="px-3.5 py-2 bg-gray-50 text-[11px] font-bold text-gray-600 uppercase tracking-wider sticky top-0 flex items-center justify-between">
                  <span>Suggested Areas for PIN {formData.pincode}</span>
                  <span className="text-[10px] font-normal text-gray-500 lowercase">click to fill or type directly</span>
                </div>
                {postOffices.map((office, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCitySelect(office.Name)}
                    className={`w-full px-3.5 py-2.5 text-left hover:bg-purple-50 transition-colors flex items-center justify-between text-xs sm:text-sm ${
                      formData.city?.toLowerCase() === office.Name.toLowerCase() ? 'bg-purple-50/70 font-bold text-purple-950' : 'text-gray-900'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs sm:text-sm">{office.Name}</div>
                      <div className="text-[10.5px] text-gray-500">{office.BranchType} • {office.DeliveryStatus}</div>
                    </div>
                    {formData.city?.toLowerCase() === office.Name.toLowerCase() && (
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-1 text-[11px] text-gray-500">
          Auto-filled from PIN. You can freely edit or type your exact locality / colony.
        </p>
        
        {errors.city && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.city}
          </p>
        )}
      </div>

      {/* Building Number / Street */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5">
          Building Number / Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.buildingNumber}
          onChange={(e) => onChange({ buildingNumber: e.target.value })}
          placeholder="House/Flat No., Building Name, Street"
          className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border-2 rounded-xl transition-all duration-200 outline-none text-xs sm:text-sm ${
            errors.buildingNumber
              ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
          }`}
        />
        {errors.buildingNumber && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.buildingNumber}
          </p>
        )}
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1.5">
          Landmark <span className="text-gray-500 text-xs">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.landmark}
          onChange={(e) => onChange({ landmark: e.target.value })}
          placeholder="Near XYZ Mall, Opposite ABC School"
          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-xl transition-all duration-200 outline-none text-xs sm:text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
        />
      </div>

      {/* Info Box */}
      {pincodeStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-2xl"
        >
          <div className="flex items-start gap-2.5 sm:gap-3">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-green-900 mb-0.5">Address Verified</p>
              <p className="text-[11px] sm:text-xs text-green-700">
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
