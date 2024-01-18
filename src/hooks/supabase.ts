import { useRef, useEffect, useState } from 'react'
import supabase from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export const useSendBroadcast = (channelName: string, eventName: string = 'event') => {
  const channelRef = useRef<RealtimeChannel>(null!)

  const send = async (payload: any) => channelRef.current.send({
    type: 'broadcast',
    event: eventName,
    payload,
  })

  useEffect(() => {
    channelRef.current = supabase
      .channel(channelName, { config: { broadcast: { ack: true } }, })
      .subscribe()
    return () => { channelRef.current.unsubscribe() }
  }, [])

  return { send }
}

export const useReceiveBroadcast = (channelName: string, eventName: string = 'event', maxQueueLength = 10) => {
  const [payloadQueue, setPayloadQueue] = useState<any[]>([])
  const latestPayload = payloadQueue.length > 0 ? payloadQueue[0] : null

  const channel = supabase.channel(channelName)
    .on('broadcast', { event: eventName }, (event: any) => {
      setPayloadQueue([event.payload, ...payloadQueue].slice(0, maxQueueLength))
    }).subscribe()

  useEffect(() => () => { channel.unsubscribe() }, [])

  return { payloadQueue, latestPayload }
}
