'use client'

/**
 * SupabaseRealtimeManager — Manages Supabase Realtime subscriptions
 * for chat messages, notifications, typing indicators, and presence.
 *
 * Uses:
 *   - Postgres Changes for new messages & notifications (INSERT events)
 *   - Broadcast for typing indicators (ephemeral, not persisted)
 *   - Presence for online status tracking
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  conversationId: string | null
  senderId: string
  receiverId: string
  content: string
  messageType: string
  isRead: boolean
  createdAt: string
  sender?: { id: string; name: string; avatar: string | null }
}

export interface NotificationPayload {
  id: string
  userId: string
  title: string
  message: string
  type: string
  category: string
  link: string | null
  image: string | null
  priority: string
  metadata: string
  isRead: boolean
  createdAt: string
}

export type TypingEvent = {
  conversationId: string
  userId: string
  userName: string
  isTyping: boolean
}

export type PresenceState = Record<
  string,
  { userId: string; userName: string; onlineAt: string }[]
>

// ─── Singleton Manager ──────────────────────────────────────────────────────

let managerInstance: SupabaseRealtimeManager | null = null

export class SupabaseRealtimeManager {
  private client: SupabaseClient
  private channels: Map<string, RealtimeChannel> = new Map()

  constructor() {
    // SECURITY: All credentials from environment variables only — never hardcode
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        '[SupabaseRealtime] ⚠️ NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables!'
      )
      // Create a dummy client that won't crash but won't work
      this.client = createClient('https://placeholder.supabase.co', 'placeholder-key', {
        realtime: { params: { eventsPerSecond: 10 } },
      })
      return
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }

  /** Get or create the singleton instance */
  static getInstance(): SupabaseRealtimeManager {
    if (!managerInstance) {
      managerInstance = new SupabaseRealtimeManager()
    }
    return managerInstance
  }

  // ── Chat: Postgres Changes ──────────────────────────────────────────

  /**
   * Subscribe to new messages in a specific conversation.
   * Listens for INSERT events on the Message table filtered by conversationId.
   */
  subscribeToChat(
    conversationId: string,
    onMessage: (message: ChatMessage) => void
  ): RealtimeChannel {
    const channelName = `chat:${conversationId}`

    // Reuse existing channel if already subscribed
    const existing = this.channels.get(channelName)
    if (existing) return existing

    const channel = this.client
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          onMessage(newMessage)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[SupabaseRealtime] Subscribed to chat: ${conversationId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[SupabaseRealtime] Channel error for chat: ${conversationId}`)
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  // ── Notifications: Postgres Changes ─────────────────────────────────

  /**
   * Subscribe to new notifications for a specific user.
   * Listens for INSERT events on the Notification table filtered by userId.
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: NotificationPayload) => void
  ): RealtimeChannel {
    const channelName = `notifications:${userId}`

    const existing = this.channels.get(channelName)
    if (existing) return existing

    const channel = this.client
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationPayload
          onNotification(newNotification)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[SupabaseRealtime] Subscribed to notifications for user: ${userId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[SupabaseRealtime] Channel error for notifications: ${userId}`)
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  // ── Typing: Broadcast ───────────────────────────────────────────────

  /**
   * Subscribe to typing indicators for a conversation.
   * Uses Supabase Broadcast (ephemeral, not persisted to DB).
   */
  subscribeToTyping(
    conversationId: string,
    onTyping: (event: TypingEvent) => void
  ): RealtimeChannel {
    const channelName = `typing:${conversationId}`

    const existing = this.channels.get(channelName)
    if (existing) return existing

    const channel = this.client
      .channel(channelName, {
        config: {
          broadcast: { self: false }, // Don't receive own typing events
        },
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        onTyping(payload.payload as TypingEvent)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[SupabaseRealtime] Subscribed to typing: ${conversationId}`)
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Broadcast a typing event to a conversation channel.
   */
  emitTyping(conversationId: string, event: TypingEvent): void {
    const channelName = `typing:${conversationId}`
    const channel = this.channels.get(channelName)

    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: event,
      })
    }
  }

  // ── Presence: Online Status ─────────────────────────────────────────

  /**
   * Subscribe to presence changes in a conversation.
   * Tracks which users are currently online in the conversation.
   */
  subscribeToPresence(
    conversationId: string,
    userId: string,
    onPresenceChange: (state: PresenceState) => void
  ): RealtimeChannel {
    const channelName = `presence:${conversationId}`

    const existing = this.channels.get(channelName)
    if (existing) return existing

    const channel = this.client
      .channel(channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as PresenceState
        onPresenceChange(state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log(`[SupabaseRealtime] User joined presence: ${key}`, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log(`[SupabaseRealtime] User left presence: ${key}`, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[SupabaseRealtime] Subscribed to presence: ${conversationId}`)
          // Track this user's presence
          await channel.track({
            userId,
            userName: '', // Will be filled by hook
            onlineAt: new Date().toISOString(),
          })
        }
      })

    this.channels.set(channelName, channel)
    return channel
  }

  /**
   * Update the user's presence data (e.g., userName).
   */
  async updatePresence(conversationId: string, data: { userName: string }): Promise<void> {
    const channelName = `presence:${conversationId}`
    const channel = this.channels.get(channelName)

    if (channel) {
      await channel.track({
        ...data,
        onlineAt: new Date().toISOString(),
      })
    }
  }

  // ── Unsubscribe ─────────────────────────────────────────────────────

  /**
   * Unsubscribe from a specific channel.
   */
  async unsubscribe(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName)
    if (channel) {
      await this.client.removeChannel(channel)
      this.channels.delete(channelName)
      console.log(`[SupabaseRealtime] Unsubscribed from: ${channelName}`)
    }
  }

  /**
   * Unsubscribe from all channels and clean up.
   */
  async unsubscribeAll(): Promise<void> {
    const channelNames = Array.from(this.channels.keys())

    for (const name of channelNames) {
      await this.unsubscribe(name)
    }

    console.log(`[SupabaseRealtime] All subscriptions cleaned up`)
  }

  /**
   * Get all active channel names (for debugging).
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys())
  }
}
