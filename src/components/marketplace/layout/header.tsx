'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ShoppingCart,
  Bell,
  Menu,
  X,
  User,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  LogOut,
  Store,
  ArrowLeftRight,
  Home,
  Compass,
  Briefcase,
  CreditCard,
  MessageSquare,
  Truck,
  MapPin,
  RotateCcw,
  Rss,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { openCartDrawer } from '@/components/marketplace/shared/cart-drawer'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { PLATFORM_NAME, USER_ROLE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ViewMode } from '@/types'
import { NotificationBell } from '@/components/marketplace/notifications/notification-bell'

export function Header() {
  const {
    currentUser,
    isAuthenticated,
    currentView,
    activeRole,
    cart,
    unreadNotifications,
    setCurrentView,
    setActiveRole,
    logout,
    setSearchQuery,
  } = useMarketplaceStore()

  const [searchInput, setSearchInput] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch unread message count
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return
    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/messages/unread-count?userId=${currentUser.id}`)
        const data = await res.json()
        if (data.success) setUnreadMessages(data.data?.count ?? 0)
      } catch {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [isAuthenticated, currentUser])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim())
      setCurrentView('search', { query: searchInput.trim() })
    }
  }

  const handleNavClick = (view: ViewMode, params?: Record<string, string>) => {
    setCurrentView(view, params)
    setMobileMenuOpen(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchExpanded && searchInputRef.current && !searchInputRef.current.parentElement?.contains(e.target as Node)) {
        if (!searchInput) setSearchExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchExpanded, searchInput])

  const navLinks = [
    { label: 'Home', view: 'landing' as ViewMode, icon: Home },
    { label: 'Browse', view: 'search' as ViewMode, icon: Compass },
    { label: 'Gigs', view: 'gigs-browse' as ViewMode, icon: Briefcase },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-1 flex-shrink-0"
            >
              <span className="text-xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {PLATFORM_NAME}
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Button
                  key={link.view}
                  variant={currentView === link.view ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavClick(link.view)}
                  className={cn(
                    'text-sm font-medium',
                    currentView === link.view
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4 mr-1.5" />
                  {link.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Center: Search bar (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products, shops..."
                className="pl-9 pr-4 h-9 bg-muted/40 border-0 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring"
              />
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setSearchExpanded(!searchExpanded)}
            >
              <Search className="h-4.5 w-4.5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              onClick={() => openCartDrawer()}
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cart.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-violet-600 to-pink-500 text-white border-0">
                  {cart.length > 99 ? '99+' : cart.length}
                </Badge>
              )}
            </Button>

            {/* Messages */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative"
                onClick={() => handleNavClick('messages')}
              >
                <MessageSquare className="h-4.5 w-4.5" />
                {unreadMessages > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold bg-emerald-500 text-white border-0">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </Badge>
                )}
              </Button>
            )}

            {/* Notifications Bell Dropdown */}
            {isAuthenticated && (
              <NotificationBell />
            )}

            {/* User Menu */}
            {isAuthenticated && currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-2 gap-2">
                    <Avatar className="h-7 w-7">
                      {currentUser?.avatar ? (
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                      ) : null}
                      <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                        {getInitials(currentUser?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline text-sm font-medium max-w-[100px] truncate">
                      {currentUser?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{currentUser?.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Role switcher for 'both' role */}
                  {currentUser?.role === 'both' && (
                    <>
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => setActiveRole(activeRole === 'buyer' ? 'seller' : 'buyer')}
                        >
                          <ArrowLeftRight className="mr-2 h-4 w-4" />
                          Switch to {activeRole === 'buyer' ? 'Seller' : 'Buyer'} Mode
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Dashboard links */}
                  <DropdownMenuGroup>
                    {activeRole === 'buyer' || currentUser?.role === 'buyer' || currentUser?.role === 'both' ? (
                      <DropdownMenuItem onClick={() => handleNavClick('buyer-dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Buyer Dashboard
                      </DropdownMenuItem>
                    ) : null}
                    {(activeRole === 'seller' || currentUser?.role === 'seller' || currentUser?.role === 'both') ? (
                      <DropdownMenuItem onClick={() => handleNavClick('seller-dashboard')}>
                        <Store className="mr-2 h-4 w-4" />
                        Seller Dashboard
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleNavClick('messages')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                      {unreadMessages > 0 && (
                        <Badge className="ml-auto h-5 px-1.5 text-[10px] bg-emerald-500 text-white border-0">
                          {unreadMessages}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('notifications')}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                      {unreadNotifications > 0 && (
                        <Badge className="ml-auto h-5 px-1.5 text-[10px] bg-red-500 text-white border-0">
                          {unreadNotifications}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      const dashboard = (activeRole === 'seller' || currentUser?.role === 'seller') ? 'seller-dashboard' : 'buyer-dashboard'
                      setCurrentView(dashboard as ViewMode, { tab: 'orders' })
                    }}>
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const dashboard = (activeRole === 'seller' || currentUser?.role === 'seller') ? 'seller-dashboard' : 'buyer-dashboard'
                        useMarketplaceStore.getState().setCurrentView(dashboard as ViewMode, { tab: 'payment-settings' })
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Info
                    </DropdownMenuItem>
                    {(activeRole === 'seller' || currentUser?.role === 'seller' || currentUser?.role === 'both') && (
                      <DropdownMenuItem onClick={() => setCurrentView('seller-dashboard', { tab: 'shipping' })}>
                        <Truck className="mr-2 h-4 w-4" />
                        Shipping Settings
                      </DropdownMenuItem>
                    )}
                    {(activeRole === 'buyer' || currentUser?.role === 'buyer' || currentUser?.role === 'both') && (
                      <DropdownMenuItem onClick={() => setCurrentView('buyer-dashboard', { tab: 'addresses' })}>
                        <MapPin className="mr-2 h-4 w-4" />
                        My Addresses
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setCurrentView('returns')}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      My Returns
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentView('disputes')}>
                      <Scale className="mr-2 h-4 w-4" />
                      Dispute Center
                    </DropdownMenuItem>
                    {(activeRole === 'seller' || currentUser?.role === 'seller' || currentUser?.role === 'both') && (
                      <DropdownMenuItem onClick={() => setCurrentView('verification-center')}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Trust Center
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setCurrentView('activity-feed')}>
                      <Rss className="mr-2 h-4 w-4" />
                      Activity Feed
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  {/* Admin link */}
                  {currentUser?.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleNavClick('admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick('auth', { mode: 'login' })}
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleNavClick('auth', { mode: 'register' })}
                  className="bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white border-0"
                >
                  Sign up
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        <AnimatePresence>
          {searchExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t"
            >
              <form onSubmit={handleSearch} className="px-4 py-2 relative">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products, shops..."
                  className="pl-9 pr-10 h-9 bg-muted/40 border-0"
                  autoFocus
                />
                {searchInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-6 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchInput('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 pb-2 border-b">
            <SheetTitle>
              <span className="text-lg font-extrabold bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {PLATFORM_NAME}
              </span>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-1">
              {/* Navigation links */}
              {navLinks.map((link) => (
                <Button
                  key={link.view}
                  variant={currentView === link.view ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3"
                  onClick={() => handleNavClick(link.view)}
                >
                  <link.icon className="h-4.5 w-4.5" />
                  {link.label}
                </Button>
              ))}

              <Separator className="my-3" />

              {/* Auth buttons (mobile) */}
              {isAuthenticated && currentUser ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <Avatar className="h-9 w-9">
                      {currentUser?.avatar ? (
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                      ) : null}
                      <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-violet-500 to-pink-500 text-white">
                        {getInitials(currentUser?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{currentUser?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {USER_ROLE_LABELS[currentUser?.role]}
                        {currentUser?.role === 'both' && activeRole === 'seller' && ' (Seller)'}
                        {currentUser?.role === 'both' && activeRole === 'buyer' && ' (Buyer)'}
                      </p>
                    </div>
                  </div>

                  {/* Role switcher */}
                  {currentUser?.role === 'both' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mb-2"
                      onClick={() => setActiveRole(activeRole === 'buyer' ? 'seller' : 'buyer')}
                    >
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      Switch to {activeRole === 'buyer' ? 'Seller' : 'Buyer'} Mode
                    </Button>
                  )}

                  {/* Dashboard links */}
                  {(activeRole === 'buyer' || currentUser?.role === 'buyer' || currentUser?.role === 'both') && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => handleNavClick('buyer-dashboard')}
                    >
                      <LayoutDashboard className="h-4.5 w-4.5" />
                      Buyer Dashboard
                    </Button>
                  )}
                  {(activeRole === 'seller' || currentUser?.role === 'seller' || currentUser?.role === 'both') && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => handleNavClick('seller-dashboard')}
                    >
                      <Store className="h-4.5 w-4.5" />
                      Seller Dashboard
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => handleNavClick('messages')}
                  >
                    <MessageSquare className="h-4.5 w-4.5" />
                    Messages
                    {unreadMessages > 0 && (
                      <Badge className="ml-auto h-5 px-1.5 text-[10px] bg-emerald-500 text-white border-0">
                        {unreadMessages}
                      </Badge>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => handleNavClick('notifications')}
                  >
                    <Bell className="h-4.5 w-4.5" />
                    Notifications
                    {unreadNotifications > 0 && (
                      <Badge className="ml-auto h-5 px-1.5 text-[10px] bg-red-500 text-white border-0">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      const dashboard = (activeRole === 'seller' || currentUser?.role === 'seller') ? 'seller-dashboard' : 'buyer-dashboard'
                      setCurrentView(dashboard as ViewMode, { tab: 'orders' })
                    }}
                  >
                    <Package className="h-4.5 w-4.5" />
                    Orders
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => handleNavClick('settings')}
                  >
                    <Settings className="h-4.5 w-4.5" />
                    Settings
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      const dashboard = (activeRole === 'seller' || currentUser?.role === 'seller') ? 'seller-dashboard' : 'buyer-dashboard'
                      useMarketplaceStore.getState().setCurrentView(dashboard as ViewMode, { tab: 'payment-settings' })
                    }}
                  >
                    <CreditCard className="h-4.5 w-4.5" />
                    Payment Info
                  </Button>

                  {(activeRole === 'seller' || currentUser?.role === 'seller' || currentUser?.role === 'both') && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => setCurrentView('seller-dashboard', { tab: 'shipping' })}
                    >
                      <Truck className="h-4.5 w-4.5" />
                      Shipping Settings
                    </Button>
                  )}
                  {(activeRole === 'buyer' || currentUser?.role === 'buyer' || currentUser?.role === 'both') && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => setCurrentView('buyer-dashboard', { tab: 'addresses' })}
                    >
                      <MapPin className="h-4.5 w-4.5" />
                      My Addresses
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => setCurrentView('returns')}
                  >
                    <RotateCcw className="h-4.5 w-4.5" />
                    My Returns
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => setCurrentView('disputes')}
                  >
                    <Scale className="h-4.5 w-4.5" />
                    Dispute Center
                  </Button>

                  {(activeRole === 'seller' || currentUser?.role === 'seller' || currentUser?.role === 'both') && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => setCurrentView('verification-center')}
                    >
                      <ShieldCheck className="h-4.5 w-4.5" />
                      Trust Center
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => setCurrentView('activity-feed')}
                  >
                    <Rss className="h-4.5 w-4.5" />
                    Activity Feed
                  </Button>

                  {currentUser?.isAdmin && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => handleNavClick('admin')}
                    >
                      <Shield className="h-4.5 w-4.5" />
                      Admin Panel
                    </Button>
                  )}

                  <Separator className="my-3" />

                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-600 hover:bg-red-50"
                    onClick={() => { logout(); setMobileMenuOpen(false) }}
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    Log out
                  </Button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleNavClick('auth', { mode: 'login' })}
                  >
                    Log in
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white border-0"
                    onClick={() => handleNavClick('auth', { mode: 'register' })}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
