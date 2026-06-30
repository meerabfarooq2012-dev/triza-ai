'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, MessageCircle, Twitter, Facebook, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'

interface ShareProductProps {
  productId: string
  productName: string
  productImage?: string
  userId: string
}

export function ShareProduct({
  productId,
  productName,
  productImage,
  userId,
}: ShareProductProps) {
  const [copied, setCopied] = useState(false)

  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?product=${productId}`
    : ''

  const trackShare = async (platform: string) => {
    try {
      await fetch('/api/social/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId,
          platform,
        }),
      })
    } catch {
      // Silently fail tracking
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl)
      setCopied(true)
      await trackShare('copy')
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleWhatsApp = () => {
    const text = `Check out "${productName}" on TRIZA! ${productUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    trackShare('whatsapp')
  }

  const handleTwitter = () => {
    const text = `Check out "${productName}" on TRIZA!`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`,
      '_blank'
    )
    trackShare('twitter')
  }

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
      '_blank'
    )
    trackShare('facebook')
  }

  const shareButtons = [
    {
      label: 'Copy Link',
      icon: copied ? Check : Copy,
      onClick: handleCopyLink,
      color: copied ? 'text-amber-600' : 'text-gray-600',
      bg: copied ? 'bg-amber-50' : 'bg-gray-50',
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      onClick: handleWhatsApp,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Twitter / X',
      icon: Twitter,
      onClick: handleTwitter,
      color: 'text-gray-800',
      bg: 'bg-gray-100',
    },
    {
      label: 'Facebook',
      icon: Facebook,
      onClick: handleFacebook,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <p className="text-sm font-medium mb-3">Share this product</p>
        <div className="grid grid-cols-2 gap-2">
          {shareButtons.map((btn) => (
            <motion.button
              key={btn.label}
              whileTap={{ scale: 0.95 }}
              onClick={btn.onClick}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium ${btn.color} ${btn.bg} hover:opacity-80 transition-opacity`}
            >
              <btn.icon className="h-4 w-4" />
              {btn.label}
            </motion.button>
          ))}
        </div>
        {productImage && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2">
            <img
              src={productImage}
              alt={productName}
              className="h-10 w-10 rounded object-cover"
            />
            <p className="text-xs text-muted-foreground truncate flex-1">
              {productName}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
