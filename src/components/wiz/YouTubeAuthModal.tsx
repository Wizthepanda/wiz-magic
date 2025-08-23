import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Youtube, Wand2, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubeAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const YouTubeAuthModal = ({ isOpen, onClose, onConfirm, isLoading = false }: YouTubeAuthModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div
              className="relative max-w-md w-full p-8 rounded-2xl border shadow-2xl"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(246, 240, 255, 0.95) 0%, 
                    rgba(255, 255, 255, 0.9) 50%,
                    rgba(249, 246, 255, 0.95) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(194, 159, 255, 0.2)',
                boxShadow: `
                  0 25px 50px rgba(124, 58, 237, 0.15),
                  0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                  0 8px 32px rgba(194, 159, 255, 0.1)
                `
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                style={{ color: '#8B5CF6' }}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <motion.div 
                className="flex justify-center mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative">
                  {/* YouTube Icon */}
                  <motion.div
                    className="relative z-10"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Youtube 
                      className="w-12 h-12"
                      style={{ color: '#FF0000' }}
                    />
                  </motion.div>
                  
                  {/* Magic Wand Overlay */}
                  <motion.div
                    className="absolute -top-2 -right-2 z-20"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  >
                    <Wand2 
                      className="w-6 h-6"
                      style={{ color: '#8B5CF6' }}
                    />
                  </motion.div>

                  {/* Floating Sparkles */}
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full"
                      style={{
                        background: 'linear-gradient(45deg, #C29FFF, #9D4EDD)',
                        boxShadow: '0 0 6px rgba(194, 159, 255, 0.8)',
                        top: i === 0 ? '10%' : i === 1 ? '70%' : '40%',
                        left: i === 0 ? '80%' : i === 1 ? '20%' : '90%',
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7],
                        y: [0, -8, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2 
                className="text-2xl font-bold text-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #9D4EDD 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                ✨ Connect YouTube. Unlock XP.
              </motion.h2>

              {/* Subtext */}
              <motion.p 
                className="text-gray-600 text-center mb-6 leading-relaxed"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Sign in with Google to start earning XP from your YouTube watch time.
                We request read-only access only — meaning we can verify views but never post, modify, or delete your content.
              </motion.p>

              {/* Benefits */}
              <motion.div 
                className="space-y-3 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  'Track your watch time seamlessly',
                  'Earn XP rewards instantly', 
                  '100% safe — read-only access'
                ].map((benefit, index) => (
                  <motion.div 
                    key={benefit}
                    className="flex items-center space-x-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span 
                      className="text-sm font-medium"
                      style={{ color: '#374151' }}
                    >
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Security Badge */}
              <motion.div 
                className="flex items-center justify-center space-x-2 mb-6 p-3 rounded-full"
                style={{ 
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  YouTube Approved • Secure • Read-Only
                </span>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold relative overflow-hidden group"
                  style={{
                    background: `
                      linear-gradient(135deg, 
                        rgba(66, 133, 244, 0.95) 0%, 
                        rgba(52, 168, 83, 0.95) 100%
                      )
                    `,
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(66, 133, 244, 0.3)',
                    color: 'white'
                  }}
                >
                  <motion.div 
                    className="flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path 
                        fill="currentColor" 
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path 
                        fill="currentColor" 
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path 
                        fill="currentColor" 
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path 
                        fill="currentColor" 
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                  </motion.div>

                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-12px"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(66, 133, 244, 0.2) 100%)',
                      filter: 'blur(1px)'
                    }}
                  />
                </Button>
              </motion.div>

              {/* Subtle disclaimer */}
              <motion.p 
                className="text-xs text-gray-500 text-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                By continuing, you agree to our Terms and Privacy Policy
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};