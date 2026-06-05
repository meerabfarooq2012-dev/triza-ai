'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Loader2,
  Save,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { USER_ROLE_LABELS } from '@/lib/constants'
import { ChangePasswordForm } from '@/components/marketplace/auth/change-password-form'

export function UserProfile() {
  const { currentUser, setCurrentView, login } = useMarketplaceStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)

  // Form state
  const [name, setName] = useState(currentUser?.name || '')
  const [bio, setBio] = useState(currentUser?.bio || '')
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [location, setLocation] = useState(currentUser?.location || '')

  // Sync form state with currentUser
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '')
      setBio(currentUser.bio || '')
      setPhone(currentUser.phone || '')
      setLocation(currentUser.location || '')
    }
  }, [currentUser])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please use JPEG, PNG, WebP, or GIF.')
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 2MB.')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const res = await api.users.uploadAvatar(currentUser.id, file)
      if (res.success && res.data) {
        // Update the user in the store
        login({
          ...currentUser,
          avatar: (res.data as { url: string }).url,
        })
        toast.success('Avatar updated successfully!')
      } else {
        toast.error((res as { error?: string }).error || 'Failed to upload avatar')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload avatar'
      toast.error(message)
    } finally {
      setIsUploadingAvatar(false)
      // Reset the file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveProfile = async () => {
    if (!currentUser) return

    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const res = await api.users.updateProfile(currentUser.id, {
        name: name.trim(),
        bio: bio.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
      })

      if (res.success && res.data) {
        login({
          ...currentUser,
          ...(res.data as Record<string, unknown>),
        })
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error((res as { error?: string }).error || 'Failed to update profile')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResendVerification = async () => {
    if (!currentUser) return

    setIsResendingVerification(true)
    try {
      const res = await api.auth.forgotPassword(currentUser.email)
      if (res.success) {
        toast.success('Verification email sent! Check your inbox.')
      } else {
        toast.error((res as { error?: string }).error || 'Failed to send verification email')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification email'
      toast.error(message)
    } finally {
      setIsResendingVerification(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset form to current user data
    setName(currentUser?.name || '')
    setBio(currentUser?.bio || '')
    setPhone(currentUser?.phone || '')
    setLocation(currentUser?.location || '')
    setIsEditing(false)
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Not Logged In</h2>
          <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
          <Button
            onClick={() => setCurrentView('auth', { mode: 'login' })}
            className="gold-gradient hover:opacity-90 text-white border-0"
          >
            Log In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => setCurrentView(
            currentUser.role === 'seller' || currentUser.role === 'both' ? 'seller-dashboard' : 'buyer-dashboard'
          )}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Dashboard
        </Button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg mb-6">
            {/* Banner background */}
            <div className="h-32 sm:h-40 gold-gradient relative">
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Profile content */}
            <div className="relative px-4 sm:px-6 pb-6">
              {/* Avatar */}
              <div className="-mt-16 sm:-mt-20 mb-4">
                <div
                  className="relative inline-block cursor-pointer group"
                  onClick={handleAvatarClick}
                >
                  <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
                    {currentUser.avatar ? (
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    ) : null}
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-amber-600 to-amber-400 text-white">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-4 border-transparent">
                    {isUploadingAvatar ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

              {/* User info */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{currentUser.name}</h1>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-amber-600 to-amber-500 text-white border-0 font-medium"
                    >
                      {USER_ROLE_LABELS[currentUser.role]}
                    </Badge>
                    {currentUser.isVerified && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {currentUser.isAdmin && (
                      <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-0">
                        Admin
                      </Badge>
                    )}
                  </div>
                  {currentUser.createdAt && (
                    <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">Member since {formatDate(currentUser.createdAt)}</span>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="gold-gradient hover:opacity-90 text-white border-0 shadow-md"
                  >
                    <User className="h-4 w-4 mr-1.5" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Profile details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details and public profile information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Name
                      </span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="profile-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        disabled={isSaving}
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 rounded-md bg-muted/50">
                        {currentUser.name || 'Not set'}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="profile-bio">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Bio
                      </span>
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id="profile-bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        disabled={isSaving}
                        className="resize-none"
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 rounded-md bg-muted/50 min-h-[60px]">
                        {currentUser.bio || 'No bio added yet.'}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        Phone
                      </span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="profile-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                        disabled={isSaving}
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 rounded-md bg-muted/50">
                        {currentUser.phone || 'Not set'}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="profile-location">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        Location
                      </span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="profile-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Your location"
                        disabled={isSaving}
                      />
                    ) : (
                      <p className="text-sm py-2 px-3 rounded-md bg-muted/50">
                        {currentUser.location || 'Not set'}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  {isEditing && (
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        onClick={handleSaveProfile}
                        className="gold-gradient hover:opacity-90 text-white border-0 shadow-md"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : (
                          <Save className="h-4 w-4 mr-1.5" />
                        )}
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Change Password Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChangePasswordForm />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right column — Status & Quick Info */}
          <div className="space-y-6">
            {/* Email Verification Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email Verification */}
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                    {currentUser.emailVerified ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Email Verified</p>
                          <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Email Not Verified</p>
                          <p className="text-xs text-muted-foreground mb-2">Verify your email to access all features.</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleResendVerification}
                            disabled={isResendingVerification}
                            className="h-7 text-xs"
                          >
                            {isResendingVerification ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : null}
                            Resend Verification
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Account Active */}
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                    {currentUser.isActive ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Account Active</p>
                          <p className="text-xs text-muted-foreground">Your account is in good standing.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Account Deactivated</p>
                          <p className="text-xs text-muted-foreground">Contact support for help.</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Identity Verification */}
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                    {currentUser.isVerified ? (
                      <>
                        <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Identity Verified</p>
                          <p className="text-xs text-muted-foreground">Your identity has been confirmed.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Identity Not Verified</p>
                          <p className="text-xs text-muted-foreground mb-2">Verify your identity to build trust.</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentView('verification-center')}
                            className="h-7 text-xs"
                          >
                            Verify Identity
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <Card className="shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Role</span>
                    <Badge variant="secondary" className="font-medium">
                      {USER_ROLE_LABELS[currentUser.role]}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="truncate ml-2 max-w-[160px] text-right">{currentUser.email}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Location</span>
                    <span className="truncate ml-2 max-w-[160px] text-right">
                      {currentUser.location || '—'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="truncate ml-2 max-w-[160px] text-right">
                      {currentUser.phone || '—'}
                    </span>
                  </div>
                  {currentUser.shop && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Shop</span>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-sm gold-gradient-text"
                          onClick={() => setCurrentView('shop-view', { shopSlug: currentUser.shop?.slug || '' })}
                        >
                          {currentUser.shop.name}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
