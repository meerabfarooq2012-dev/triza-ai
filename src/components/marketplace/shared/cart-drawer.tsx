'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/marketplace/shared/empty-state'
import { CheckoutModal } from '@/components/marketplace/payment/checkout-modal'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { CartItem } from '@/types'

// Simple event bus for cart drawer
const cartDrawerListeners: Set<(open: boolean) => void> = new Set()

export function openCartDrawer() {
  cartDrawerListeners.forEach((listener) => listener(true))
}

export function CartDrawer() {
  const [open, setOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const { cart: rawCart, cartTotal, removeFromCart, updateCartQuantity, clearCart } = useMarketplaceStore()
  // Defensive: ensure cart is always an array (can be corrupted in localStorage)
  const cart = Array.isArray(rawCart) ? rawCart : []

  // Register listener
  useEffect(() => {
    cartDrawerListeners.add(setOpen)
    return () => {
      cartDrawerListeners.delete(setOpen)
    }
  }, [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {cart.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({cart.length} {cart.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Browse products and add items to your cart"
            actionLabel="Start Shopping"
            onAction={() => setOpen(false)}
            className="flex-1"
          />
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-1">
                {cart.map((item) => (
                  <CartItemRow
                    key={`${item.productId}-${item.variantId ?? 'default'}`}
                    item={item}
                    onUpdateQuantity={updateCartQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="border-t bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold">${(cartTotal ?? 0).toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
              <Button className="w-full" size="lg" onClick={() => setCheckoutOpen(true)}>
                Checkout — ${(cartTotal ?? 0).toFixed(2)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>

      {/* Checkout Modal */}
      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </Sheet>
  )
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number, variantId?: string | null) => void
  onRemove: (productId: string, variantId?: string | null) => void
}) {
  return (
    <div className="flex gap-3 py-3">
      {/* Image */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted/30">
        {item.variantImage || item.image ? (
          <img
            src={item.variantImage || item.image || ''}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{item.name}</h4>
        {item.variantLabel && (
          <p className="text-xs text-amber-600 font-medium truncate">{item.variantLabel}</p>
        )}
        <p className="text-xs text-muted-foreground">{item.shopName}</p>
        <div className="flex items-center justify-between mt-1.5">
          {/* Quantity controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.variantId)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.variantId)}
              disabled={item.quantity >= item.stock && item.stock > 0}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <span className="text-sm font-semibold">
            ${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(item.productId, item.variantId)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
