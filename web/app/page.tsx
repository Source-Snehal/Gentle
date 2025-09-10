'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useAuthSession } from '@/hooks/useAuthSession'
import { Heart, Sparkles, List, BarChart3, ArrowRight } from 'lucide-react'

export default function WelcomePage() {
  const { session, loading } = useAuthSession()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your email for a magic link!')
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-gentle-300 border-t-gentle-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gentle-600">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (session) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        <div className="space-y-8">
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, duration: 1 }}
            className="relative"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-gentle-400 via-ocean-400 to-green-400 rounded-full animate-pulse-glow opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-700/70 rounded-full flex items-center justify-center mx-auto backdrop-blur-xl border border-white/30">
                <Heart className="w-10 h-10 text-gentle-500 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
            className="space-y-4 relative"
          >
            {/* Floating background elements */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-to-r from-gentle-200/30 to-ocean-200/30 rounded-full blur-3xl animate-float"></div>
            
            <motion.h1 
              className="relative text-6xl md:text-7xl lg:text-8xl font-extralight bg-gradient-to-r from-gentle-600 via-ocean-500 via-green-500 to-gentle-600 bg-300% bg-clip-text text-transparent leading-none tracking-tighter animate-shimmer"
              initial={{ opacity: 0, scale: 0.9, rotateX: 90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
              style={{
                backgroundImage: 'linear-gradient(90deg, hsl(var(--gentle-600)), hsl(var(--ocean-500)), hsl(var(--green-500)), hsl(var(--gentle-600)))',
                backgroundSize: '300% 100%',
                animation: 'shimmer 3s ease-in-out infinite'
              }}
            >
              Gentle
            </motion.h1>
            
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
            >
              <motion.p 
                className="text-2xl md:text-3xl text-gentle-700/90 dark:text-gentle-300/90 font-light italic max-w-2xl mx-auto leading-relaxed backdrop-blur-sm bg-white/20 dark:bg-black/20 rounded-2xl px-6 py-3 border border-white/30"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                Life is big, let's make it small together
              </motion.p>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="space-y-2 pt-4"
          >
            <p className="text-gentle-600 text-lg text-balance max-w-md mx-auto">
              Ready to take the next step?
            </p>
          </motion.div>
        </div>

        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card className="relative p-8 space-y-6 glass-strong rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl shadow-gentle-500/20 overflow-hidden group">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gentle-100/50 via-ocean-100/30 to-green-100/50 dark:from-gentle-800/30 dark:via-ocean-900/20 dark:to-green-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating sparkle effect */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-gentle-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-6 left-6 w-1 h-1 bg-ocean-400 rounded-full animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-gentle-700 dark:text-gentle-300 mb-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="p-2 bg-gradient-to-br from-gentle-200/50 to-ocean-200/50 rounded-xl backdrop-blur"
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <span className="font-semibold text-lg">Progress, not perfection</span>
              </div>
              
              <p className="text-gentle-600 dark:text-gentle-400 text-balance leading-relaxed text-lg">
                Every small step matters. We'll help you break down what feels overwhelming into manageable pieces that honor where you are today.
              </p>
            </div>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <Link href="/decompose">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Button 
                className="relative w-full h-16 text-xl font-semibold rounded-3xl bg-gradient-to-r from-gentle-500 via-ocean-500 to-green-500 hover:from-gentle-600 hover:via-ocean-600 hover:to-green-600 text-white shadow-2xl shadow-gentle-500/30 hover:shadow-gentle-500/50 transition-all duration-300 group overflow-hidden border border-white/20"
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className="relative flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart className="w-6 h-6" />
                  </motion.div>
                  <span>Take a tiny step</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </motion.div>
                </div>
              </Button>
            </motion.div>
          </Link>
          
          <p className="text-sm text-gentle-500">
            Start where it feels right for you today
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-8"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Heart className="w-16 h-16 text-gentle-400 mx-auto" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
          className="space-y-3"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-light bg-gradient-to-r from-gentle-600 via-ocean-500 to-green-500 bg-clip-text text-transparent leading-tight tracking-tight"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
          >
            Gentle
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gentle-700 dark:text-gentle-300 font-light italic max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
          >
            Life is big, let's make it small together
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="space-y-2 pt-4"
        >
          <p className="text-gentle-600 text-lg text-balance max-w-md mx-auto">
            Whatever you're feeling is okay. Start where you are.
          </p>
        </motion.div>
      </div>

      <Card className="p-6 space-y-6 bg-gradient-to-br from-white/80 to-gentle-50/80 dark:from-gentle-800/50 dark:to-gentle-700/50 backdrop-blur border-gentle-200 dark:border-gentle-600 shadow-lg">
        <div className="space-y-2">
          <h2 className="text-xl font-medium">Get started</h2>
          <p className="text-gentle-600 text-sm text-balance">
            We'll send you a magic link—no passwords needed
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-center rounded-xl border-gentle-200 dark:border-gentle-700 focus:border-gentle-400 dark:focus:border-gentle-500 bg-white/80 dark:bg-gentle-800/80"
            disabled={isLoading}
            required
          />
          
          <Button 
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-gentle-500 to-ocean-500 hover:from-gentle-600 hover:to-ocean-600 disabled:from-gentle-300 disabled:to-gentle-300 text-white transition-all duration-200"
          >
            {isLoading ? 'Sending...' : 'Send magic link'}
          </Button>
        </form>

        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm text-center ${
              message.includes('Check') 
                ? 'text-gentle-700 dark:text-gentle-300' 
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {message}
          </motion.p>
        )}
      </Card>

      <div className="text-xs text-gentle-500 space-y-1">
        <p>No spam, ever. We respect your privacy.</p>
        <p>You can unsubscribe at any time.</p>
      </div>
    </motion.div>
  )
}