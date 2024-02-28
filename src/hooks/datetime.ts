import { useState, useEffect } from 'react'

export const useCountdown = (date: Date | null, options?: { finishMessage?: string }) => {
  const [countdown, setCountdown] = useState('')
  const { finishMessage } = { finishMessage: '', ...options }

  useEffect(() => {
    if (date && date > new Date()) {
      const intervalId = setInterval(() => {
        const now = new Date()
        const diff = date.getTime() - now.getTime()

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`)

        if (diff < 0) {
          clearInterval(intervalId)
          setCountdown(finishMessage)
        }
      }, 1000)

      return () => clearInterval(intervalId)
    }
  }, [date])

  return countdown
}
