'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Palette,
  Layout,
  Type,
  Link2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Store,
  Check,
  ImagePlus,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import {
  SHOP_COLOR_PRESETS,
  LAYOUT_STYLE_LABELS,
  DISPLAY_STYLE_LABELS,
  CUSTOM_SECTION_TYPES,
  SOCIAL_PLATFORM_LABELS,
} from '@/lib/constants'
import type {
  Shop,
  LayoutStyle,
  DisplayStyle,
  CustomSection,
  SocialPlatform,
  SocialLink,
} from '@/types'
import { toast } from 'sonner'
import { countryCodeData } from '@/lib/country-codes'

export function SellerShopSettings() {
  const { currentUser } = useMarketplaceStore()
  const [saving, setSaving] = useState(false)
  const [shop, setShop] = useState<Shop | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [about, setAbout] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1')
  const [countrySearch, setCountrySearch] = useState('')
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [address, setAddress] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6')
  const [accentColor, setAccentColor] = useState('#a78bfa')
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('grid')
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>('modern')
  const [customSections, setCustomSections] = useState<CustomSection[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [logo, setLogo] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  // Temp state for adding
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newSectionType, setNewSectionType] = useState('text')
  const [newSectionContent, setNewSectionContent] = useState('')
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatform>('website')
  const [newSocialUrl, setNewSocialUrl] = useState('')

  useEffect(() => {
    if (currentUser?.shop) {
      const s = currentUser.shop
      setShop(s)
      setName(s.name)
      setDescription(s.description || '')
      setAbout(s.about || '')
      setContactEmail(s.contactEmail || '')
      setContactPhone(s.contactPhone || '')
      setAddress(s.address || '')
      setPrimaryColor(s.primaryColor)
      setSecondaryColor(s.secondaryColor)
      setAccentColor(s.accentColor)
      setLayoutStyle(s.layoutStyle)
      setDisplayStyle(s.displayStyle)

      // Parse custom sections
      try {
        const sections = JSON.parse(s.customSections || '[]')
        setCustomSections(sections)
      } catch {
        setCustomSections([])
      }

      setSocialLinks(s.socialLinks || [])
      setLogo(s.logo || null)
      setBanner(s.banner || null)

      // Parse country code from phone number
      if (s.contactPhone) {
        const match = s.contactPhone.match(/^\+(\d{1,4})\s*(.*)/)
        if (match) {
          setPhoneCountryCode('+' + match[1])
          setContactPhone(match[2] || '')
        } else {
          setContactPhone(s.contactPhone)
        }
      }
    }
  }, [currentUser])

  const handleSelectPreset = (preset: (typeof SHOP_COLOR_PRESETS)[number]) => {
    setPrimaryColor(preset.primary)
    setSecondaryColor(preset.secondary)
    setAccentColor(preset.accent)
  }

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return
    const newSection: CustomSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle.trim(),
      type: newSectionType as CustomSection['type'],
      content: newSectionContent.trim(),
      sortOrder: customSections.length,
      isActive: true,
    }
    setCustomSections([...customSections, newSection])
    setNewSectionTitle('')
    setNewSectionType('text')
    setNewSectionContent('')
  }

  const handleRemoveSection = (id: string) => {
    setCustomSections(customSections.filter((s) => s.id !== id))
  }

  const handleMoveSection = (id: string, direction: 'up' | 'down') => {
    const idx = customSections.findIndex((s) => s.id === id)
    if (idx === -1) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === customSections.length - 1) return

    const newSections = [...customSections]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newSections[idx], newSections[swapIdx]] = [newSections[swapIdx], newSections[idx]]
    setCustomSections(newSections.map((s, i) => ({ ...s, sortOrder: i })))
  }

  const handleAddSocialLink = () => {
    if (!newSocialUrl.trim()) return
    const newLink: SocialLink = {
      id: `social-${Date.now()}`,
      userId: currentUser?.id || '',
      shopId: shop?.id || null,
      platform: newSocialPlatform,
      url: newSocialUrl.trim(),
      createdAt: new Date().toISOString(),
    }
    setSocialLinks([...socialLinks, newLink])
    setNewSocialUrl('')
  }

  const handleRemoveSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter((l) => l.id !== id))
  }

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      if (type === 'logo') {
        setLogo(result)
      } else {
        setBanner(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!shop) return
    setSaving(true)
    try {
      const res = await fetch(`/api/shops/${shop.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          name,
          description,
          about,
          logo,
          banner,
          contactEmail,
          contactPhone: contactPhone ? `${phoneCountryCode} ${contactPhone}`.trim() : '',
          address,
          primaryColor,
          secondaryColor,
          accentColor,
          layoutStyle,
          displayStyle,
          customSections,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Shop settings saved successfully!')
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save shop settings:', error)
      toast.error('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Shop Branding */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-emerald-600" />
            Shop Branding
          </CardTitle>
          <CardDescription>
            Upload your shop logo and banner image
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-3">
            <Label>Shop Logo</Label>
            <div className="flex items-start gap-4">
              <div className="relative">
                {logo ? (
                  <div className="group relative h-24 w-24 overflow-hidden rounded-xl border-2 border-gray-100 shadow-sm">
                    <img
                      src={logo}
                      alt="Shop logo"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setLogo(null)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50">
                    <div className="flex flex-col items-center gap-1">
                      <ImagePlus className="h-6 w-6 text-gray-400" />
                      <span className="text-[10px] text-gray-400">Upload</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Upload your shop logo. This appears in your shop header and search results.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Recommended: 200×200px, max 2MB, PNG or JPG
                </p>
                {logo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setLogo(null)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove Logo
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Banner Upload */}
          <div className="space-y-3">
            <Label>Shop Banner</Label>
            <div className="space-y-2">
              {banner ? (
                <div className="group relative overflow-hidden rounded-xl border-2 border-gray-100 shadow-sm">
                  <img
                    src={banner}
                    alt="Shop banner"
                    className="h-40 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setBanner(null)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-emerald-300 hover:bg-emerald-50/50">
                  <div className="flex flex-col items-center gap-2">
                    <ImagePlus className="h-8 w-8 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500">Click to upload banner</p>
                      <p className="text-xs text-gray-400">Recommended: 1200×300px, max 2MB</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                  />
                </label>
              )}
              {banner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => setBanner(null)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Remove Banner
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-600" />
            Shop Information
          </CardTitle>
          <CardDescription>
            Basic information about your shop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="shop-name">Shop Name</Label>
            <Input
              id="shop-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your shop name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shop-desc">Description</Label>
            <Textarea
              id="shop-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your shop"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shop-about">About Section</Label>
            <Textarea
              id="shop-about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell customers about your shop, your story, and what makes you unique"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-emerald-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="contact-email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Contact Email
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@yourshop.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-phone" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Contact Phone
            </Label>
            <div className="flex gap-2">
              {/* Country Code Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setCountryDropdownOpen(!countryDropdownOpen); setCountrySearch('') }}
                  className="flex h-9 w-[100px] items-center justify-between rounded-md border border-input bg-background px-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="truncate">{phoneCountryCode}</span>
                  <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                </button>
                {countryDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCountryDropdownOpen(false)} />
                    <div className="absolute left-0 top-full z-50 mt-1 w-[280px] overflow-hidden rounded-lg border bg-background shadow-lg">
                      <div className="p-2 border-b">
                        <Input
                          placeholder="Search country..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-[240px] overflow-y-auto">
                        {countryCodeData
                          .filter((c) =>
                            c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                            c.code.includes(countrySearch) ||
                            c.dial_code.includes(countrySearch)
                          )
                          .map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors ${
                                phoneCountryCode === c.dial_code ? 'bg-emerald-50 text-emerald-700' : ''
                              }`}
                              onClick={() => {
                                setPhoneCountryCode(c.dial_code)
                                setCountryDropdownOpen(false)
                                setCountrySearch('')
                              }}
                            >
                              <span className="text-base leading-none">{c.flag}</span>
                              <span className="flex-1 text-left truncate">{c.name}</span>
                              <span className="text-xs text-muted-foreground shrink-0">{c.dial_code}</span>
                            </button>
                          ))}
                        {countryCodeData.filter((c) =>
                          c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                          c.code.includes(countrySearch) ||
                          c.dial_code.includes(countrySearch)
                        ).length === 0 && (
                          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                            No country found
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* Phone Number Input */}
              <Input
                id="contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-400">
              Full number: {phoneCountryCode} {contactPhone}
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Address
            </Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your shop address"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Theme */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-emerald-600" />
            Color Theme
          </CardTitle>
          <CardDescription>
            Choose a color theme for your shop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset Swatches */}
          <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
            {SHOP_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                className={`group relative flex flex-col items-center gap-1`}
                onClick={() => handleSelectPreset(preset)}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    primaryColor === preset.primary
                      ? 'border-emerald-600 scale-110 shadow-md'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                  }}
                >
                  {primaryColor === preset.primary && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-[10px] text-gray-500 truncate max-w-[60px]">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="overflow-hidden rounded-xl border">
            <div
              className="p-4 flex items-center gap-3"
              style={{ background: primaryColor }}
            >
              {logo ? (
                <img src={logo} alt="Logo" className="h-10 w-10 rounded-lg object-cover border border-white/20" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <Store className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white">{name || 'Shop Name'}</h3>
                <p className="text-sm text-white/80">
                  {description || 'Shop description preview'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 p-4 bg-white">
              <div
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                style={{ background: secondaryColor }}
              >
                Button
              </div>
              <div
                className="rounded-lg border-2 px-3 py-1.5 text-xs font-medium"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                Outlined
              </div>
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Primary</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Secondary</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Accent</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout & Display Style */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-emerald-600" />
              Layout Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(LAYOUT_STYLE_LABELS).map(([value, label]) => (
              <button
                key={value}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  layoutStyle === value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
                onClick={() => setLayoutStyle(value as LayoutStyle)}
              >
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                </div>
                {/* Mini preview */}
                <div
                  className={`flex gap-0.5 ${
                    value === 'list' ? 'flex-col' : ''
                  }`}
                >
                  {[...Array(value === 'featured' ? 3 : 4)].map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        value === 'featured' && i === 0
                          ? 'h-6 w-8'
                          : value === 'list'
                          ? 'h-2 w-12'
                          : 'h-4 w-4'
                      } ${
                        layoutStyle === value
                          ? 'bg-emerald-400'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-emerald-600" />
              Display Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(DISPLAY_STYLE_LABELS).map(([value, label]) => (
              <button
                key={value}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  displayStyle === value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
                onClick={() => setDisplayStyle(value as DisplayStyle)}
              >
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div
                    className={`h-1.5 w-8 rounded-full ${
                      displayStyle === value ? 'bg-emerald-400' : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`h-1 w-6 rounded-full ${
                      displayStyle === value ? 'bg-emerald-300' : 'bg-gray-200'
                    }`}
                  />
                  <div
                    className={`h-0.5 w-4 rounded-full ${
                      displayStyle === value ? 'bg-emerald-200' : 'bg-gray-100'
                    }`}
                  />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Custom Sections */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-emerald-600" />
            Custom Sections
          </CardTitle>
          <CardDescription>
            Add custom sections to your shop page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Sections */}
          {customSections.length > 0 && (
            <div className="space-y-2">
              {customSections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleMoveSection(section.id, 'up')}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleMoveSection(section.id, 'down')}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {section.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {CUSTOM_SECTION_TYPES.find((t) => t.value === section.type)?.label || section.type} • {section.content.slice(0, 50)}{section.content.length > 50 ? '...' : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={() => handleRemoveSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Add New Section */}
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700">Add New Section</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Title</Label>
                <Input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="Section title"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={newSectionType} onValueChange={setNewSectionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOM_SECTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Content</Label>
              <Textarea
                value={newSectionContent}
                onChange={(e) => setNewSectionContent(e.target.value)}
                placeholder="Section content"
                rows={2}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleAddSection}
              disabled={!newSectionTitle.trim()}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Section
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-emerald-600" />
            Social Links
          </CardTitle>
          <CardDescription>
            Add links to your social profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Links */}
          {socialLinks.length > 0 && (
            <div className="space-y-2">
              {socialLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
                >
                  <Globe className="h-4 w-4 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {SOCIAL_PLATFORM_LABELS[link.platform]}
                    </p>
                    <p className="truncate text-xs text-gray-500">{link.url}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={() => handleRemoveSocialLink(link.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Add New Link */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid flex-1 grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Platform</Label>
                <Select
                  value={newSocialPlatform}
                  onValueChange={(v) =>
                    setNewSocialPlatform(v as SocialPlatform)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SOCIAL_PLATFORM_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 grid gap-1.5">
                <Label className="text-xs">URL</Label>
                <Input
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  placeholder="https://"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={handleAddSocialLink}
              disabled={!newSocialUrl.trim()}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => {
            // Reset form to original values
            if (currentUser?.shop) {
              const s = currentUser.shop
              setName(s.name)
              setDescription(s.description || '')
              setAbout(s.about || '')
              setContactEmail(s.contactEmail || '')
              if (s.contactPhone) {
                const match = s.contactPhone.match(/^\+(\d{1,4})\s*(.*)/)
                if (match) {
                  setPhoneCountryCode('+' + match[1])
                  setContactPhone(match[2] || '')
                } else {
                  setPhoneCountryCode('+1')
                  setContactPhone(s.contactPhone)
                }
              } else {
                setPhoneCountryCode('+1')
                setContactPhone('')
              }
              setAddress(s.address || '')
              setPrimaryColor(s.primaryColor)
              setSecondaryColor(s.secondaryColor)
              setAccentColor(s.accentColor)
              setLayoutStyle(s.layoutStyle)
              setDisplayStyle(s.displayStyle)
              setLogo(s.logo || null)
              setBanner(s.banner || null)
            }
          }}
        >
          Reset Changes
        </Button>
        <Button
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
