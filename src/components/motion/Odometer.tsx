import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MOTION_SPRINGS } from '@/motion/tokens'

interface OdometerProps {
  value: number | string
  prefix?: string
  suffix?: string
  className?: string
  ariaLabel?: string
}

const SingleDigit: React.FC<{ digit: string }> = ({ digit }) => {
  if (isNaN(Number(digit))) {
    return <span>{digit}</span>
  }

  return (
    <span className="inline-block relative overflow-hidden h-[1.25em] w-[0.62em] align-top text-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={MOTION_SPRINGS.soft}
          style={{ willChange: 'transform, opacity' }}
          className="inline-block w-full text-center"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export const Odometer: React.FC<OdometerProps> = ({
  value,
  prefix = '',
  suffix = '',
  className = '',
  ariaLabel,
}) => {
  const [displayStr, setDisplayStr] = useState<string>(String(value))

  useEffect(() => {
    setDisplayStr(String(value))
  }, [value])

  return (
    <span
      className={`inline-flex items-center tabular-nums font-heading ${className}`}
      aria-label={ariaLabel || `${prefix}${value}${suffix}`}
    >
      {prefix && <span className="mr-0.5">{prefix}</span>}
      <span className="inline-flex">
        {displayStr.split('').map((char, index) => (
          <SingleDigit key={`${index}-${char}`} digit={char} />
        ))}
      </span>
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  )
}

export default Odometer
