import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

import { adminLogin } from '@/api'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Auth store
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated)
  const login = useAdminAuthStore((state) => state.login)
  const recordFailedAttempt = useAdminAuthStore((state) => state.recordFailedAttempt)
  const resetFailedAttempts = useAdminAuthStore((state) => state.resetFailedAttempts)
  const lockedUntil = useAdminAuthStore((state) => state.lockedUntil)

  // Form states
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [keepSignedIn, setKeepSignedIn] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Expired session banner check
  const isSessionExpiredNotice = 
    location.search.includes('expired=1') || 
    Boolean((location.state as any)?.expired)


  // Error & shake animation states
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState<number>(0)

  // Lockout countdown state
  const [remainingLockSeconds, setRemainingLockSeconds] = useState<number>(0)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Check for expired session on mount
  useEffect(() => {
    const isExpired = useAdminAuthStore.getState().isSessionExpired()
    if (isExpired) {
      useAdminAuthStore.getState().logout()
      toast.error('Your session has expired. Please log in again.')
    }
  }, [])

  // Check and run lockout countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      if (!lockedUntil) {
        setRemainingLockSeconds(0)
        return
      }

      const now = Date.now()
      if (now >= lockedUntil) {
        resetFailedAttempts()
        setRemainingLockSeconds(0)
        setErrorMessage(null)
      } else {
        const remaining = Math.ceil((lockedUntil - now) / 1000)
        setRemainingLockSeconds(remaining)
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [lockedUntil, resetFailedAttempts])

  const isLocked = remainingLockSeconds > 0

  const formatCountdown = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading || isLocked) return

    setErrorMessage(null)

    if (!username.trim() || !password) {
      setErrorMessage('Incorrect ID or password')
      setShakeKey((prev) => prev + 1)
      return
    }

    setIsLoading(true)

    try {
      const res = await adminLogin({
        username: username.trim(),
        password
      })

      // Successful login
      login(res.token, res.user, keepSignedIn)
      toast.success(`Welcome back, ${res.user.name}`)
      navigate('/admin', { replace: true })
    } catch {
      // Record failed attempt
      const attemptResult = recordFailedAttempt()

      // Shake the card on error
      setShakeKey((prev) => prev + 1)

      if (attemptResult.locked) {
        setErrorMessage(
          `Too many attempts. Try again in 5 minutes (${formatCountdown(attemptResult.remainingSeconds)})`
        )
      } else {
        setErrorMessage('Incorrect ID or password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main aria-label="Admin authentication" className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Radial Brand Blobs per spec */}
      <div aria-hidden="true" className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--brand)]/10 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div aria-hidden="true" className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--brand-2)]/14 blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Centered Glass Card (max 400px) */}
      <motion.div
        key={shakeKey}
        initial={{ opacity: 0, y: 28 }}
        animate={
          shakeKey > 0
            ? {
                x: [-12, 12, -10, 10, -6, 6, -2, 2, 0],
                y: 0,
                opacity: 1,
                transition: { duration: 0.45, ease: 'easeInOut' }
              }
            : {
                x: 0,
                y: 0,
                opacity: 1,
                transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
              }
        }
        className="w-full max-w-[400px] glass-card p-6 sm:p-8 rounded-[24px] shadow-xl relative z-10 space-y-6"
      >
        {/* Header: 64px Logo on white rounded tile with SVG border draw, Title & Subtitle */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-18 h-18 flex items-center justify-center">
            {/* SVG hairline border draw animation */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 72 72"
              fill="none"
              aria-hidden="true"
            >
              <motion.rect
                x="2"
                y="2"
                width="68"
                height="68"
                rx="16"
                stroke="var(--brand)"
                strokeWidth="1.5"
                strokeDasharray="260"
                initial={{ strokeDashoffset: 260 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>

            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-white shadow-md p-2 flex items-center justify-center"
            >
              <img
                src="/logo-128.webp"
                alt="TKS Iyengars Logo"
                width="64"
                height="64"
                decoding="async"
                className="w-full h-full object-contain"
              />
            </motion.div>
          </div>

          <div>
            <h1 className="font-serif text-3xl font-normal text-[var(--brand-900)] tracking-tight">
              Admin login
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium pt-0.5">
              TKS Iyengars Catering
            </p>
          </div>
        </div>

        {/* Session Expired Notice Banner */}
        {isSessionExpiredNotice && !errorMessage && !isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-bold flex items-start gap-2 shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-tight">
              Your session has expired. Please log in again to continue.
            </span>
          </motion.div>
        )}

        {/* Error Banner: 'Incorrect ID or password' or Lockout message */}
        {(errorMessage || isLocked) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-[var(--status-cancelled-bg)] border border-[var(--status-cancelled-border)] text-[var(--status-cancelled-text)] text-xs font-bold flex items-start gap-2 shadow-xs"
          >
            {isLocked ? (
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span className="leading-tight">
              {isLocked
                ? `Too many attempts. Try again in 5 minutes (${formatCountdown(remainingLockSeconds)})`
                : errorMessage}
            </span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Admin ID Field */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="admin-username"
              className="text-xs font-bold text-[var(--text-primary)] block"
            >
              Admin ID
            </label>
            <Input
              id="admin-username"
              type="text"
              autoComplete="username"
              disabled={isLoading || isLocked}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errorMessage && !isLocked) setErrorMessage(null)
              }}
              placeholder="e.g. admin"
              className="h-11 rounded-xl bg-white/90 text-sm font-medium"
            />
          </div>

          {/* Password Field with Show/Hide Eye Toggle */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="admin-password"
              className="text-xs font-bold text-[var(--text-primary)] block"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={isLoading || isLocked}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errorMessage && !isLocked) setErrorMessage(null)
                }}
                placeholder="••••••••"
                className="h-11 pr-11 rounded-xl bg-white/90 text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors tap-target-48"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 stroke-[2]" />
                ) : (
                  <Eye className="w-4 h-4 stroke-[2]" />
                )}
              </button>
            </div>
          </div>

          {/* 'Keep me signed in on this device' Switch */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <label
              htmlFor="keep-signed-in"
              className="text-xs font-semibold text-[var(--text-muted)] cursor-pointer select-none"
            >
              Keep me signed in on this device
            </label>
            <Switch
              id="keep-signed-in"
              checked={keepSignedIn}
              onCheckedChange={setKeepSignedIn}
              disabled={isLoading || isLocked}
            />
          </div>

          {/* Large Full-Width Brand Button 'Log in' with Loading State */}
          <button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full h-12 rounded-full bg-[var(--brand)] hover:bg-[var(--brand-600)] text-[var(--on-brand)] font-heading font-bold text-sm shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 tap-target-48 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : isLocked ? (
              <span>Locked ({formatCountdown(remainingLockSeconds)})</span>
            ) : (
              <span>Log in</span>
            )}
          </button>
        </form>

        {/* Small Grey Text under Button: 'Forgot your password? Contact your developer.' */}
        <div className="text-center pt-1 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium">
            Forgot your password? Contact your developer.
          </p>
        </div>
      </motion.div>

    </main>
  )
}

export default AdminLoginPage
