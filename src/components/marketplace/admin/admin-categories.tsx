'use client'

import { useEffect, useState, useCallback, Fragment } from 'react'
import {
  Search,
  Plus,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  MoreHorizontal,
  Download,
  Package,
  Briefcase,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { GIG_CATEGORIES, PHYSICAL_CATEGORIES, DIGITAL_CATEGORIES } from '@/lib/constants'

// Category type with relations
interface CategoryWithRelations {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  children?: CategoryWithRelations[]
  _count?: { products: number; gigs: number }
}

// Form data type
interface CategoryFormData {
  name: string
  slug: string
  icon: string
  description: string
  sortOrder: number
  isActive: boolean
  parentId: string
}

const emptyForm: CategoryFormData = {
  name: '',
  slug: '',
  icon: '',
  description: '',
  sortOrder: 0,
  isActive: true,
  parentId: '',
}

// Derive category type from slug
function getCategoryType(slug: string): 'digital' | 'physical' | 'gig' | null {
  // Check subcategory slug pattern (parentSlug--childSlug)
  const parentSlug = slug.includes('--') ? slug.split('--')[0] : slug

  if (DIGITAL_CATEGORIES.some(c => c.slug === parentSlug)) return 'digital'
  if (PHYSICAL_CATEGORIES.some(c => c.slug === parentSlug)) return 'physical'
  if (GIG_CATEGORIES.some(c => c.slug === parentSlug)) return 'gig'
  return null
}

function CategoryTypeBadge({ slug }: { slug: string }) {
  const type = getCategoryType(slug)
  switch (type) {
    case 'digital':
      return <Badge variant="outline" className="text-xs gap-1 bg-amber-50 text-amber-700 border-amber-200"><Download size={12} /> Digital</Badge>
    case 'physical':
      return <Badge variant="outline" className="text-xs gap-1 bg-orange-50 text-orange-700 border-orange-200"><Package size={12} /> Physical</Badge>
    case 'gig':
      return <Badge variant="outline" className="text-xs gap-1 bg-teal-50 text-teal-700 border-teal-200"><Briefcase size={12} /> Gig</Badge>
    default:
      return <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">Other</Badge>
  }
}

// Slug generation helper
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function AdminCategories() {
  const { currentUser } = useMarketplaceStore()

  const [categories, setCategories] = useState<CategoryWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('__all__')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithRelations | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [seeding, setSeeding] = useState(false)

  // Fetch all categories (including inactive for admin)
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories?includeInactive=true')
      const data = await res.json()
      if (data.success && data.data) {
        setCategories(data.data)
      }
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Get top-level categories
  const topLevelCategories = categories.filter(c => !c.parentId)

  // Filter categories
  const filteredCategories = topLevelCategories.filter(cat => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      const matchesSelf = cat.name.toLowerCase().includes(searchLower) || cat.slug.toLowerCase().includes(searchLower)
      const matchesChild = cat.children?.some(c =>
        c.name.toLowerCase().includes(searchLower) || c.slug.toLowerCase().includes(searchLower)
      )
      if (!matchesSelf && !matchesChild) return false
    }

    // Type filter
    if (typeFilter !== '__all__') {
      const catType = getCategoryType(cat.slug)
      if (typeFilter !== catType) return false
    }

    return true
  })

  // Handle form slug auto-generation
  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const newSlug = !editingId ? toSlug(name) : prev.slug
      return { ...prev, name, slug: newSlug }
    })
  }

  // Open create dialog
  const openCreate = (parentId?: string) => {
    setEditingId(null)
    setFormData({
      ...emptyForm,
      parentId: parentId || '',
    })
    setFormOpen(true)
  }

  // Open edit dialog
  const openEdit = (cat: CategoryWithRelations) => {
    setEditingId(cat.id)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '',
      description: cat.description || '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      parentId: cat.parentId || '',
    })
    setFormOpen(true)
  }

  // Submit form
  const handleSubmit = async () => {
    if (!currentUser?.id) return
    if (!formData.name || !formData.slug) return

    setSubmitting(true)
    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/categories/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            ...formData,
            parentId: formData.parentId || null,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert(data.error || 'Failed to update category')
          return
        }
      } else {
        // Create
        const res = await fetch('/api/categories/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            ...formData,
            parentId: formData.parentId || null,
          }),
        })
        const data = await res.json()
        if (!data.success) {
          alert(data.error || 'Failed to create category')
          return
        }
      }
      setFormOpen(false)
      fetchCategories()
    } catch {
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle active
  const handleToggleActive = async (cat: CategoryWithRelations) => {
    if (!currentUser?.id) return
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          isActive: !cat.isActive,
        }),
      })
      const data = await res.json()
      if (data.success) fetchCategories()
    } catch {
      // silent
    }
  }

  // Delete
  const handleDelete = async () => {
    if (!currentUser?.id || !deletingCategory) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/categories/${deletingCategory.id}?userId=${currentUser.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        setDeleteOpen(false)
        setDeletingCategory(null)
        fetchCategories()
      } else {
        alert(data.error || 'Failed to delete category')
      }
    } catch {
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Seed categories
  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/categories/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        alert(data.message || 'Categories seeded successfully')
        fetchCategories()
      } else {
        alert(data.error || 'Failed to seed categories')
      }
    } catch {
      alert('Failed to seed categories')
    } finally {
      setSeeding(false)
    }
  }

  // Count totals
  const totalCategories = categories.length
  const totalTopLevel = topLevelCategories.length
  const totalSubcategories = categories.filter(c => c.parentId).length

  // Get all top-level categories for parent select
  const parentOptions = topLevelCategories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Category Management</h2>
          <p className="text-sm text-muted-foreground">
            {totalCategories} total ({totalTopLevel} top-level, {totalSubcategories} subcategories)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => openCreate()} size="sm">
            <Plus size={16} className="mr-1" />
            Add Category
          </Button>
          <Button onClick={handleSeed} variant="outline" size="sm" disabled={seeding}>
            {seeding ? <Loader2 size={16} className="mr-1 animate-spin" /> : <RefreshCw size={16} className="mr-1" />}
            Seed All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 sm:flex-none sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            <SelectItem value="digital">Digital</SelectItem>
            <SelectItem value="physical">Physical</SelectItem>
            <SelectItem value="gig">Gig</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories table - Desktop */}
      <Card className="border-0 shadow-sm hidden md:block">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-6 h-6" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <FolderTree size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No categories found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &quot;Seed All&quot; to populate default categories or &quot;Add Category&quot; to create one manually.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden lg:table-cell">Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Subcategories</TableHead>
                  <TableHead className="hidden md:table-cell">Products</TableHead>
                  <TableHead className="hidden md:table-cell">Gigs</TableHead>
                  <TableHead className="hidden lg:table-cell">Active</TableHead>
                  <TableHead className="w-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => {
                  const hasChildren = cat.children && cat.children.length > 0
                  const isExpanded = expandedIds.has(cat.id)

                  return (
                    <Fragment key={cat.id}>
                      <TableRow className={!cat.isActive ? 'opacity-50' : ''}>
                        <TableCell>
                          {hasChildren ? (
                            <button
                              onClick={() => toggleExpand(cat.id)}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                          ) : (
                            <span className="inline-block w-6" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {cat.icon && <span className="text-muted-foreground text-sm">{cat.icon}</span>}
                            <div>
                              <p className="font-medium text-sm">{cat.name}</p>
                              {cat.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-48">{cat.description}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{cat.slug}</code>
                        </TableCell>
                        <TableCell>
                          <CategoryTypeBadge slug={cat.slug} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {hasChildren ? cat.children!.length : 0}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {cat._count?.products ?? 0}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {cat._count?.gigs ?? 0}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Switch
                            checked={cat.isActive}
                            onCheckedChange={() => handleToggleActive(cat)}
                            aria-label="Toggle active"
                          />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(cat)}>
                                <Pencil size={14} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openCreate(cat.id)}>
                                <Plus size={14} className="mr-2" />
                                Add Subcategory
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeletingCategory(cat)
                                  setDeleteOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>

                      {/* Expanded subcategories */}
                      {isExpanded && hasChildren && cat.children!.map((sub) => (
                        <TableRow key={sub.id} className={`bg-muted/30 ${!sub.isActive ? 'opacity-50' : ''}`}>
                          <TableCell></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 pl-6">
                              <span className="text-muted-foreground">└</span>
                              <div>
                                <p className="text-sm">{sub.name}</p>
                                {sub.description && (
                                  <p className="text-xs text-muted-foreground truncate max-w-48">{sub.description}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{sub.slug}</code>
                          </TableCell>
                          <TableCell>
                            <CategoryTypeBadge slug={sub.slug} />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">—</TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {sub._count?.products ?? 0}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {sub._count?.gigs ?? 0}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Switch
                              checked={sub.isActive}
                              onCheckedChange={() => handleToggleActive(sub)}
                              aria-label="Toggle active"
                            />
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(sub)}>
                                  <Pencil size={14} className="mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDeletingCategory(sub)
                                    setDeleteOpen(true)
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Categories cards - Mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No categories found</p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const hasChildren = cat.children && cat.children.length > 0
            const isExpanded = expandedIds.has(cat.id)

            return (
              <Card key={cat.id} className={!cat.isActive ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{cat.name}</p>
                        <CategoryTypeBadge slug={cat.slug} />
                        <Switch
                          checked={cat.isActive}
                          onCheckedChange={() => handleToggleActive(cat)}
                          aria-label="Toggle active"
                          className="scale-75"
                        />
                      </div>
                      <code className="text-xs text-muted-foreground">{cat.slug}</code>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{cat._count?.products ?? 0} products</span>
                        <span>{cat._count?.gigs ?? 0} gigs</span>
                        {hasChildren && <span>{cat.children!.length} subcategories</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasChildren && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpand(cat.id)}>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(cat)}>
                            <Pencil size={14} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openCreate(cat.id)}>
                            <Plus size={14} className="mr-2" />
                            Add Subcategory
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setDeletingCategory(cat)
                              setDeleteOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Expanded subcategories - mobile */}
                  {isExpanded && hasChildren && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      {cat.children!.map((sub) => (
                        <div
                          key={sub.id}
                          className={`flex items-center justify-between gap-2 pl-4 py-1.5 border-l-2 border-muted ${!sub.isActive ? 'opacity-50' : ''}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm">{sub.name}</p>
                              <Switch
                                checked={sub.isActive}
                                onCheckedChange={() => handleToggleActive(sub)}
                                aria-label="Toggle active"
                                className="scale-75"
                              />
                            </div>
                            <code className="text-xs text-muted-foreground">{sub.slug}</code>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(sub)}>
                                <Pencil size={14} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeletingCategory(sub)
                                  setDeleteOpen(true)
                                }}
                                className="text-red-600"
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Category' : formData.parentId ? 'Add Subcategory' : 'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the category details below.' : 'Fill in the details to create a new category.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                placeholder="e.g., Graphic Design"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input
                id="cat-slug"
                placeholder="e.g., graphic-design"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                {formData.parentId
                  ? `Full slug will be: ${parentOptions.find(p => p.id === formData.parentId)?.slug}--${formData.slug}`
                  : 'Lowercase letters, numbers, and hyphens only'
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-icon">Icon Name</Label>
              <Input
                id="cat-icon"
                placeholder="e.g., Palette, Globe, Briefcase"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Lucide icon name (e.g., Palette, Globe, Camera)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                placeholder="Brief description of this category..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cat-sort">Sort Order</Label>
                <Input
                  id="cat-sort"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cat-parent">Parent Category</Label>
                <Select
                  value={formData.parentId || '__none__'}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, parentId: val === '__none__' ? '' : val }))}
                >
                  <SelectTrigger id="cat-parent">
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None (top-level)</SelectItem>
                    {parentOptions
                      .filter(p => p.id !== editingId) // Don't allow self-reference
                      .map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="cat-active" className="cursor-pointer">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive categories won&apos;t appear to users</p>
              </div>
              <Switch
                id="cat-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.slug}>
              {submitting && <Loader2 size={16} className="mr-1 animate-spin" />}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingCategory?.name}&quot;?
              {deletingCategory?.children && deletingCategory.children.length > 0 && (
                <span className="block mt-2 text-orange-600 font-medium">
                  This category has {deletingCategory.children.length} subcategories that will be reassigned to top-level.
                </span>
              )}
              {(deletingCategory?._count?.products ?? 0) > 0 && (
                <span className="block mt-1 text-orange-600 font-medium">
                  {deletingCategory._count?.products} products will be unlinked from this category.
                </span>
              )}
              {(deletingCategory?._count?.gigs ?? 0) > 0 && (
                <span className="block mt-1 text-orange-600 font-medium">
                  {deletingCategory._count?.gigs} gigs will be unlinked from this category.
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting && <Loader2 size={16} className="mr-1 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
