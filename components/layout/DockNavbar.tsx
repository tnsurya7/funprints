'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, Package, Mail } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';

interface DockIconProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  badge?: number;
  mouseX: any;
}

function DockIcon({ href, icon: Icon, label, isActive, badge, mouseX }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 56, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        style={{ width }}
        className="relative group aspect-square"
      >
        <motion.div
          className={`w-full h-full flex items-center justify-center rounded-[20px] transition-all duration-300 ${
            isActive
              ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30'
              : 'bg-white/90 backdrop-blur-md hover:bg-white shadow-md hover:shadow-lg'
          }`}
          whileHover={{ y: -8 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-700'}`} />
          
          {badge !== undefined && badge > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg"
            >
              {badge}
            </motion.span>
          )}
        </motion.div>

        {/* Tooltip */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="px-2.5 py-1 bg-gray-900/95 backdrop-blur-sm text-white text-[11px] font-medium rounded-lg whitespace-nowrap">
            {label}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function DockNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const mouseX = useMotionValue(Infinity);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/products', icon: ShoppingBag, label: 'Products' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartItems.length },
    { href: '/bulk-order', icon: Package, label: 'Bulk Order' },
    { href: '/contact', icon: Mail, label: 'Contact' },
  ];

  return (
    <>
      {/* Desktop Dock - Webdeo Style */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`hidden md:block fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          isScrolled ? 'scale-95 top-3' : 'scale-100'
        }`}
      >
        <motion.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="flex items-end gap-2 px-4 py-3 rounded-[24px] bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-black/10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
          }}
        >
          {navItems.map((item) => (
            <DockIcon
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
              badge={item.badge}
              mouseX={mouseX}
            />
          ))}
        </motion.div>
      </motion.nav>

      {/* Mobile Bottom Dock - Curved Style */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md"
      >
        <div 
          className="flex items-center justify-around px-3 py-3 rounded-[28px] bg-white/85 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-black/10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.8) 100%)',
          }}
        >
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="relative">
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ y: -4 }}
                className={`p-3 rounded-[18px] transition-all duration-300 ${
                  pathname === item.href
                    ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30'
                    : 'bg-transparent hover:bg-gray-100/50'
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    pathname === item.href ? 'text-white' : 'text-gray-700'
                  }`}
                />
                
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.nav>
    </>
  );
}