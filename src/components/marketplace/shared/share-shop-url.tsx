'use client'

import { useState, useCallback } from 'react'
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ShareShopUrlProps {
  url: string
  title: string
  description?: string
  shareText?: string
}

export function ShareShopUrl({ url, title, description, shareText }: ShareShopUrlProps) {
  const [copied, setCopied] = useState(false)

  const defaultShareText = shareText || `Check out ${title} on Thiora! 🛍️`

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('URL copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      toast.success('URL copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }, [url])

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${defaultShareText}\n${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(defaultShareText)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(defaultShareText)}`,
  }

  const handleSocialShare = useCallback((platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer,width=600,height=400')
  }, [shareUrls])

  const socialButtons = [
    { key: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle, color: 'hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950' },
    { key: 'facebook' as const, label: 'Facebook', icon: Facebook, color: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950' },
    { key: 'twitter' as const, label: 'X / Twitter', icon: Twitter, color: 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100' },
    { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin, color: 'hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950' },
    { key: 'telegram' as const, label: 'Telegram', icon: Send, color: 'hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-950' },
  ]

  return (
    <div className="space-y-4">
      {/* URL display with copy button */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Share URL</label>
        <div className="flex items-center gap-2">
          <Input
            value={url}
            readOnly
            className="flex-1 text-sm bg-muted/50"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            variant={copied ? 'default' : 'outline'}
            size="sm"
            onClick={handleCopyUrl}
            className="shrink-0 gap-1.5 min-w-[90px]"
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Social media share buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Share on social media</label>
        <div className="flex flex-wrap gap-2">
          {socialButtons.map(({ key, label, icon: Icon, color }) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className={`gap-1.5 transition-colors ${color}`}
              onClick={() => handleSocialShare(key)}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* URL preview */}
      <div className="rounded-lg border bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground mb-1">Preview</p>
        <p className="text-sm font-mono break-all text-foreground/80">{url}</p>
      </div>
    </div>
  )
}
