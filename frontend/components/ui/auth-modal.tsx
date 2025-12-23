'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Github, Mail, Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { signIn } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (provider: 'google' | 'github' | 'azure') => {
    try {
      setLoading(provider)
      setError(null)
      await signIn(provider)
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
      setLoading(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#111] border border-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-light text-white">Sign in to ASPERA</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-400 mb-8">
          Choose your preferred authentication method to get started
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => handleSignIn('google')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-100 py-6"
          >
            <Chrome className="w-5 h-5" />
            {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <Button
            onClick={() => handleSignIn('github')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white hover:bg-[#1a1e22] py-6"
          >
            <Github className="w-5 h-5" />
            {loading === 'github' ? 'Signing in...' : 'Continue with GitHub'}
          </Button>

          <Button
            onClick={() => handleSignIn('azure')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 bg-[#0084ff] text-white hover:bg-[#0066cc] py-6"
          >
            <Mail className="w-5 h-5" />
            {loading === 'azure' ? 'Signing in...' : 'Continue with Microsoft'}
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
