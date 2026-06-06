'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  UserX,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { api } from '@/lib/api'
import { USER_ROLE_LABELS, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { User, UserRole } from '@/types'

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('__all__')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
      }
      if (search) params.search = search
      if (roleFilter !== '__all__') params.role = roleFilter

      const res = await api.admin.getUsers(params as any)
      if (res.data) {
        const data = res.data as any
        if (data.items) {
          setUsers(data.items)
          setTotalPages(data.totalPages)
          setTotalUsers(data.total)
        } else if (Array.isArray(data)) {
          setUsers(data)
        }
      }
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleActivateUser = async (userId: string, activate: boolean) => {
    try {
      await api.admin.updateUser(userId, { isActive: activate } as any)
      fetchUsers()
    } catch {
      // silent fail
    }
  }

  const handleMakeAdmin = async (userId: string) => {
    try {
      await api.admin.updateUser(userId, { isAdmin: true } as any)
      fetchUsers()
    } catch {
      // silent fail
    }
  }

  const handleVerifyUser = async (userId: string) => {
    try {
      await api.admin.updateUser(userId, { isVerified: true } as any)
      fetchUsers()
    } catch {
      // silent fail
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            {totalUsers} total users
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 sm:w-64"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Roles</SelectItem>
              <SelectItem value="buyer">Buyers</SelectItem>
              <SelectItem value="seller">Sellers</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="w-10">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {user.name[0]}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm">{user.name}</p>
                            {user.isAdmin && (
                              <ShieldCheck size={14} className="text-primary" />
                            )}
                            {user.isVerified && (
                              <UserCheck size={14} className="text-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {USER_ROLE_LABELS[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={user.isActive ? 'default' : 'secondary'}
                        className={`text-xs ${
                          user.isActive
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                            : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!user.isVerified && (
                            <DropdownMenuItem onClick={() => handleVerifyUser(user.id)}>
                              <UserCheck size={14} className="mr-2" />
                              Verify User
                            </DropdownMenuItem>
                          )}
                          {user.isActive ? (
                            <DropdownMenuItem onClick={() => handleActivateUser(user.id, false)}>
                              <UserX size={14} className="mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleActivateUser(user.id, true)}>
                              <UserCheck size={14} className="mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {!user.isAdmin && (
                            <DropdownMenuItem onClick={() => handleMakeAdmin(user.id)}>
                              <ShieldCheck size={14} className="mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}
