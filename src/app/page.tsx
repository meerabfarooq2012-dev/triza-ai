'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * ============================================================
 *  MERI AI — Professional ChatGPT-jaisi AI
 * ============================================================
 *
 *  Real LLM backend (z-ai-web-dev-sdk)
 *  Permanent chat history (local SQLite)
 *  Multi-conversation support
 *  Markdown rendering
 *  Roman Urdu friendly personality
 *
 *  Structure:
 *    - Sidebar: conversations list + new chat button
 *    - Main: chat area (messages) + input box
 *    - Header: AI name + model info
 * ============================================================
 */

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  title: string
  messageCount: number
  lastMessage: string | null
  createdAt: string
  updatedAt: string
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingConvo, setLoadingConvo] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load conversations list on mount
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch('/api/ai/conversations')
        const data = await res.json()
        if (!cancelled) setConversations(data.conversations || [])
      } catch (e) {
        console.error(e)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  // Load messages when active conversation changes
  const loadMessages = useCallback(async (convoId: string) => {
    setLoadingConvo(true)
    try {
      const res = await fetch(`/api/ai/conversations/${convoId}`)
      const data = await res.json()
      if (data.conversation) {
        setMessages(data.conversation.messages || [])
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingConvo(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (activeConvoId) {
        setLoadingConvo(true)
        try {
          const res = await fetch(`/api/ai/conversations/${activeConvoId}`)
          const data = await res.json()
          if (!cancelled && data.conversation) {
            setMessages(data.conversation.messages || [])
          }
        } catch (e) {
          console.error(e)
        }
        if (!cancelled) setLoadingConvo(false)
      } else {
        setMessages([])
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [activeConvoId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Create new conversation
  const newChat = async () => {
    try {
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      })
      const data = await res.json()
      if (data.id) {
        setActiveConvoId(data.id)
        setMessages([])
        await loadConversations()
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const deleteConvo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Yeh chat delete kar dein?')) return
    try {
      await fetch(`/api/ai/conversations/${id}`, { method: 'DELETE' })
      if (activeConvoId === id) {
        setActiveConvoId(null)
        setMessages([])
      }
      await loadConversations()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={appContainer}>
      {/* Inject custom styles (SSR-safe via dangerouslySetInnerHTML) */}
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />

      {/* === SIDEBAR === */}
      <aside
        style={{
          ...sidebarStyle,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <SidebarHeader onNewChat={newChat} onClose={() => setSidebarOpen(false)} />

        <div style={convoListStyle}>
          {conversations.length === 0 ? (
            <div style={emptySidebarStyle}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>💬</div>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                Abhi koi chat nahi.
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                &quot;New Chat&quot; dabao shuru karne ke liye.
              </p>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvoId(c.id)}
                style={{
                  ...convoItemStyle,
                  background:
                    activeConvoId === c.id ? '#2a2a3a' : 'transparent',
                  borderColor:
                    activeConvoId === c.id ? '#7c3aed44' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (activeConvoId !== c.id) {
                    e.currentTarget.style.background = '#1f1f2e'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeConvoId !== c.id) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div style={convoItemContentStyle}>
                  <span style={convoTitleStyle}>{c.title}</span>
                  <span style={convoMetaStyle}>
                    {c.messageCount} messages
                  </span>
                </div>
                <span
                  onClick={(e) => deleteConvo(c.id, e)}
                  style={deleteBtnStyle}
                  title='Delete'
                >
                  ×
                </span>
              </button>
            ))
          )}
        </div>

        <SidebarFooter />
      </aside>

      {/* === MAIN CHAT AREA === */}
      <main style={mainStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={iconBtnStyle}
            title='Toggle sidebar'
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={logoStyle}>✦</div>
            <div>
              <div style={headerTitleStyle}>Meri AI</div>
              <div style={headerSubtitleStyle}>
                {activeConvoId
                  ? 'Online • Local memory'
                  : 'Professional AI • Roman Urdu ready'}
              </div>
            </div>
          </div>
          <button
            onClick={newChat}
            style={{
              ...iconBtnStyle,
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: 'white',
              border: 'none',
              width: '40px',
              height: '40px',
            }}
            title='New chat'
          >
            +
          </button>
        </header>

        {/* Messages */}
        <div style={messagesContainerStyle}>
          {!activeConvoId ? (
            <WelcomeScreen onNewChat={newChat} />
          ) : loadingConvo ? (
            <div style={loadingStyle}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
              Loading chat...
            </div>
          ) : messages.length === 0 ? (
            <EmptyChatScreen onNewChat={newChat} />
          ) : (
            <div style={{ maxWidth: '780px', margin: '0 auto', width: '100%' }}>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              <div ref={messagesEndRef} style={{ height: '20px' }} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          ref={inputRef}
          activeConvoId={activeConvoId}
          onNewChat={newChat}
          onSent={(userMsg, aiResponse, convoId) => {
            // Add both messages to UI immediately
            setMessages((prev) => [
              ...prev,
              {
                id: 'temp-' + Date.now() + '-u',
                role: 'user',
                content: userMsg,
                createdAt: new Date().toISOString(),
              },
              {
                id: 'temp-' + Date.now() + '-a',
                role: 'assistant',
                content: aiResponse,
                createdAt: new Date().toISOString(),
              },
            ])
            // Refresh conversation list (title may have changed)
            loadConversations()
          }}
        />
      </main>
    </div>
  )
}

// ============================================================
// SIDEBAR COMPONENTS
// ============================================================

function SidebarHeader({
  onNewChat,
  onClose,
}: {
  onNewChat: () => void
  onClose: () => void
}) {
  return (
    <div style={sidebarHeaderStyle}>
      <button
        onClick={onClose}
        style={{
          ...iconBtnStyle,
          display: 'none',
        }}
        className='md-show'
      >
        ×
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ ...logoStyle, width: '28px', height: '28px', fontSize: '14px' }}>
          ✦
        </div>
        <span style={{ color: '#e5e7eb', fontWeight: 700, fontSize: '15px' }}>
          Meri AI
        </span>
      </div>
      <button onClick={onNewChat} style={newChatBtnStyle} title='New chat'>
        + New
      </button>
    </div>
  )
}

function SidebarFooter() {
  return (
    <div style={sidebarFooterStyle}>
      <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: 1.6 }}>
        💾 Local database — sab chats permanent
        <br />
        🔒 Sirf mera — Thiora se alag
      </div>
    </div>
  )
}

// ============================================================
// MESSAGE BUBBLE
// ============================================================

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: isUser
            ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
            : 'linear-gradient(135deg, #ec4899, #f59e0b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: '13px',
          flexShrink: 0,
        }}
      >
        {isUser ? 'Me' : 'AI'}
      </div>
      <div
        style={{
          maxWidth: '85%',
          background: isUser ? '#2a2a3a' : '#1a1a26',
          border: isUser ? '1px solid #374151' : '1px solid #2a2a3a',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding: '12px 16px',
          color: '#e5e7eb',
          fontSize: '14px',
          lineHeight: 1.7,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {renderContent(message.content)}
      </div>
    </div>
  )
}

// Simple markdown-ish renderer (code blocks + bold + inline code)
function renderContent(text: string): React.ReactNode {
  const parts = text.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const inner = part.slice(3, -3)
      const lines = inner.split('\n')
      const lang = lines[0].trim()
      const code = lang ? lines.slice(1).join('\n') : inner
      return (
        <pre
          key={i}
          style={{
            background: '#0a0a14',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '8px',
            marginBottom: '8px',
            overflowX: 'auto',
            fontSize: '13px',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            color: '#c4b5fd',
          }}
        >
          <code>{code}</code>
        </pre>
      )
    }
    // Inline code + bold
    return (
      <span key={i}>
        {formatInline(part)}
      </span>
    )
  })
}

function formatInline(text: string): React.ReactNode {
  // Split by inline code and bold
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            background: '#0a0a14',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#c4b5fd',
          }}
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

// ============================================================
// WELCOME / EMPTY SCREENS
// ============================================================

function WelcomeScreen({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div style={welcomeStyle}>
      <div style={{ fontSize: '60px', marginBottom: '14px' }}>✦</div>
      <h1
        style={{
          fontSize: '38px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}
      >
        Meri AI
      </h1>
      <p style={{ color: '#9ca3af', fontSize: '15px', marginBottom: '6px' }}>
        Professional AI • Roman Urdu ready • Permanent memory
      </p>
      <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '28px' }}>
        Apni AI se baat karne ke liye naya chat shuru karo.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px',
          maxWidth: '600px',
          width: '100%',
          marginBottom: '24px',
        }}
      >
        <SuggestionCard
          emoji='✍️'
          title='Sher likhne mein madad'
          subtitle='Mood batao, AI sher likhe gi'
        />
        <SuggestionCard
          emoji='💡'
          title='Ideas brainstorm'
          subtitle='Design ya writing ideas'
        />
        <SuggestionCard
          emoji='📖'
          title='Kuch bhi poocho'
          subtitle='Homework, general knowledge'
        />
        <SuggestionCard
          emoji='🎨'
          title='Design feedback'
          subtitle='Apne design ka review lo'
        />
      </div>

      <button
        onClick={onNewChat}
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
          color: 'white',
          border: 'none',
          padding: '14px 32px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
        }}
      >
        ✦ Naya Chat Shuru Karo
      </button>
    </div>
  )
}

function EmptyChatScreen({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div style={welcomeStyle}>
      <div style={{ fontSize: '48px', marginBottom: '14px' }}>💬</div>
      <h2 style={{ color: '#a78bfa', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
        Nai Chat Khali Hai
      </h2>
      <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
        Neeche message likho aur AI se baat shuru karo.
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Hello!', 'Meri introduction karao', 'Ek sher likho'].map((s) => (
          <span
            key={s}
            style={{
              background: '#1a1a26',
              border: '1px solid #2a2a3a',
              color: '#c4b5fd',
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: '12px',
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function SuggestionCard({
  emoji,
  title,
  subtitle,
}: {
  emoji: string
  title: string
  subtitle: string
}) {
  return (
    <div
      style={{
        background: '#1a1a26',
        border: '1px solid #2a2a3a',
        borderRadius: '12px',
        padding: '14px',
        textAlign: 'left',
        transition: 'border-color 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#7c3aed66')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a3a')}
    >
      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{emoji}</div>
      <div style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>
        {title}
      </div>
      <div style={{ color: '#6b7280', fontSize: '11px' }}>{subtitle}</div>
    </div>
  )
}

// ============================================================
// CHAT INPUT
// ============================================================

const ChatInput = (() => {
  function ChatInputInner(
    {
      activeConvoId,
      onNewChat,
      onSent,
    }: {
      activeConvoId: string | null
      onNewChat: () => void
      onSent: (userMsg: string, aiResponse: string, convoId: string) => void
    },
    ref: React.Ref<HTMLTextAreaElement>
  ) {
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)

    const send = async () => {
      const msg = text.trim()
      if (!msg || sending) return

      let convoId = activeConvoId
      if (!convoId) {
        // Create new conversation first
        try {
          const res = await fetch('/api/ai/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'New Chat' }),
          })
          const data = await res.json()
          convoId = data.id
        } catch (e) {
          console.error(e)
          return
        }
      }

      setSending(true)
      setText('')
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: convoId, message: msg }),
        })
        const data = await res.json()
        if (data.response) {
          onSent(msg, data.response, convoId!)
        } else {
          alert(data.error || 'AI se connect nahi ho paayi')
        }
      } catch (e) {
        console.error(e)
        alert('Network error - try again')
      }
      setSending(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        send()
      }
    }

    return (
      <div style={inputContainerStyle}>
        <div style={inputBoxStyle}>
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Meri AI ko message likho... (Enter = bhejo, Shift+Enter = nai line)'
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e5e7eb',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'none',
              maxHeight: '160px',
              padding: '12px 0',
              lineHeight: 1.6,
            }}
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            style={{
              ...sendBtnStyle,
              opacity: !text.trim() || sending ? 0.4 : 1,
              cursor: !text.trim() || sending ? 'not-allowed' : 'pointer',
            }}
          >
            {sending ? (
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                ◌
              </span>
            ) : (
              '→'
            )}
          </button>
        </div>
        <div style={inputHintStyle}>
          Meri AI galat ho sakti hai. Important cheezein verify karo.
        </div>
      </div>
    )
  }
  return Object.assign(
    (props: any, ref: any) => ChatInputInner(props, ref),
    { displayName: 'ChatInput' }
  ) as React.ForwardRefExoticComponent<
    {
      activeConvoId: string | null
      onNewChat: () => void
      onSent: (userMsg: string, aiResponse: string, convoId: string) => void
    } & React.RefAttributes<HTMLTextAreaElement>
  >
})()

// ============================================================
// STYLES
// ============================================================

const appContainer: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  background: '#0a0a0f',
  color: '#e5e7eb',
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  overflow: 'hidden',
}

const sidebarStyle: React.CSSProperties = {
  width: '280px',
  background: '#0d0d15',
  borderRight: '1px solid #1f2937',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease',
  flexShrink: 0,
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  zIndex: 50,
}

const sidebarHeaderStyle: React.CSSProperties = {
  padding: '14px',
  borderBottom: '1px solid #1f2937',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
}

const newChatBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
  color: 'white',
  border: 'none',
  padding: '7px 14px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
}

const convoListStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '8px',
}

const emptySidebarStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '40px 14px',
  color: '#6b7280',
}

const convoItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid transparent',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'inherit',
  color: '#e5e7eb',
  marginBottom: '2px',
  transition: 'background 0.1s',
}

const convoItemContentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  overflow: 'hidden',
}

const convoTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const convoMetaStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#6b7280',
}

const deleteBtnStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '16px',
  padding: '4px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
  lineHeight: 1,
  fontWeight: 700,
  flexShrink: 0,
}

const sidebarFooterStyle: React.CSSProperties = {
  padding: '14px',
  borderTop: '1px solid #1f2937',
}

const mainStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 0,
  width: '100%',
  height: '100vh',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 18px',
  borderBottom: '1px solid #1f2937',
  background: '#0d0d15',
  flexShrink: 0,
}

const iconBtnStyle: React.CSSProperties = {
  background: '#1f2937',
  border: '1px solid #374151',
  color: '#c4b5fd',
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  fontSize: '18px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const logoStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '18px',
  fontWeight: 700,
}

const headerTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#e5e7eb',
}

const headerSubtitleStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#6b7280',
}

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '24px 18px',
  scrollBehavior: 'smooth',
}

const loadingStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#9ca3af',
  fontSize: '14px',
}

const welcomeStyle: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '40px 20px',
}

const inputContainerStyle: React.CSSProperties = {
  padding: '14px 18px 18px',
  background: '#0a0a0f',
  borderTop: '1px solid #1f2937',
  flexShrink: 0,
}

const inputBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '8px',
  background: '#1a1a26',
  border: '1px solid #2a2a3a',
  borderRadius: '14px',
  padding: '0 8px 0 14px',
  maxWidth: '780px',
  margin: '0 auto',
  transition: 'border-color 0.15s',
}

const sendBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
  color: 'white',
  border: 'none',
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  fontSize: '18px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginBottom: '6px',
}

const inputHintStyle: React.CSSProperties = {
  textAlign: 'center',
  fontSize: '10px',
  color: '#4b5563',
  marginTop: '8px',
  maxWidth: '780px',
  margin: '8px auto 0',
}

// Custom scrollbar styling — injected via component below
const styleSheet = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #2a2a3a;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #3a3a4a;
  }
`
