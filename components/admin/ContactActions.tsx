'use client';

import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';

interface ContactActionsProps {
  name?: string;
  phone?: string | null;
  email?: string | null;
  contextMessage?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Normalizes an Indian phone number to international format (e.g. 919876543210).
 * Handles numbers with spaces, dashes, leading 0, +91, or bare 10 digits.
 */
export function normalizeIndianPhone(phone?: string | null): string {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

export function isValidPhone(phone?: string | null): boolean {
  const norm = normalizeIndianPhone(phone);
  return norm.length >= 10 && norm.length <= 15;
}

export function isValidEmail(email?: string | null): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ContactActions({
  name = 'Customer',
  phone,
  email,
  contextMessage,
  className = '',
  compact = false,
}: ContactActionsProps) {
  const validPhone = isValidPhone(phone);
  const validEmail = isValidEmail(email);
  const normalizedPhone = normalizeIndianPhone(phone);

  const defaultMessage = `Hi ${name}, thank you for contacting FunPrint! How can we assist you today?`;
  const whatsappUrl = validPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(contextMessage || defaultMessage)}`
    : '';

  const telUrl = validPhone ? `tel:+${normalizedPhone}` : '';
  const mailtoUrl = validEmail ? `mailto:${email?.trim()}?subject=${encodeURIComponent(`FunPrint Support - ${name}`)}` : '';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* WhatsApp Button */}
      {validPhone ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Chat with ${name} on WhatsApp (+${normalizedPhone})`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all hover:scale-105"
          aria-label={`WhatsApp ${name}`}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {!compact && <span>WhatsApp</span>}
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="WhatsApp unavailable (No valid phone number)"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-400 font-bold text-[11px] cursor-not-allowed opacity-60"
          aria-label="WhatsApp unavailable"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {!compact && <span>WhatsApp</span>}
        </button>
      )}

      {/* Call Button */}
      {validPhone ? (
        <a
          href={telUrl}
          title={`Call ${name} (+${normalizedPhone})`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shadow-2xs transition-all hover:scale-105"
          aria-label={`Call ${name}`}
        >
          <Phone className="w-3.5 h-3.5" />
          {!compact && <span>Call</span>}
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="Phone call unavailable (No valid phone number)"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-400 font-bold text-[11px] cursor-not-allowed opacity-60"
          aria-label="Call unavailable"
        >
          <Phone className="w-3.5 h-3.5" />
          {!compact && <span>Call</span>}
        </button>
      )}

      {/* Email Button */}
      {validEmail ? (
        <a
          href={mailtoUrl}
          title={`Email ${email}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-bold text-[11px] shadow-2xs transition-all hover:scale-105 truncate max-w-[150px]"
          aria-label={`Email ${name}`}
        >
          <Mail className="w-3.5 h-3.5 text-stone-300" />
          {!compact && <span>Email</span>}
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="Email unavailable (No valid email address)"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-400 font-bold text-[11px] cursor-not-allowed opacity-60"
          aria-label="Email unavailable"
        >
          <Mail className="w-3.5 h-3.5" />
          {!compact && <span>Email</span>}
        </button>
      )}
    </div>
  );
}
