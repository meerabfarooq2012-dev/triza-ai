'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MessageCircleQuestion,
  Send,
  Loader2,
  User,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  CheckCircle2,
  Circle,
  Package,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { useToast } from '@/hooks/use-toast'
import type { ProductQuestion } from '@/types'

interface ProductWithQuestions {
  productId: string
  productName: string
  productImage: string | null
  questions: ProductQuestion[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function SellerQA() {
  const { currentUser } = useMarketplaceStore()
  const { toast } = useToast()

  const [allQuestions, setAllQuestions] = useState<ProductWithQuestions[]>([])
  const [loading, setLoading] = useState(true)
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({})
  const [submittingAnswers, setSubmittingAnswers] = useState<Record<string, boolean>>({})
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('unanswered')

  const fetchQuestions = useCallback(async () => {
    if (!currentUser) return
    try {
      setLoading(true)
      // Get the seller's shop
      const shopRes = await fetch(`/api/shops?userId=${currentUser.id}`)
      const shopData = await shopRes.json()
      const shop = shopData.data?.shop || shopData.data
      if (!shop?.id) {
        setLoading(false)
        return
      }

      // Get products for this shop
      const productsRes = await fetch(`/api/products?shopId=${shop.id}&limit=100`)
      const productsData = await productsRes.json()
      const products = productsData.data?.items || productsData.data?.products || []

      // Fetch questions for each product
      const questionsByProduct: ProductWithQuestions[] = []
      await Promise.all(
        products.map(async (product: { id: string; name: string; images: string }) => {
          try {
            const res = await fetch(`/api/products/${product.id}/questions`)
            const data = await res.json()
            const questions: ProductQuestion[] = data.data?.questions || []
            if (questions.length > 0) {
              let productImage: string | null = null
              try {
                const imgs = JSON.parse(product.images || '[]')
                productImage = imgs[0] || null
              } catch {
                // ignore
              }
              questionsByProduct.push({
                productId: product.id,
                productName: product.name,
                productImage,
                questions,
              })
            }
          } catch {
            // skip this product's questions on error
          }
        })
      )

      setAllQuestions(questionsByProduct)
    } catch (error) {
      console.error('Error fetching seller questions:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  const handlePostAnswer = async (productId: string, questionId: string) => {
    if (!currentUser || !answerTexts[questionId]?.trim()) return
    setSubmittingAnswers((prev) => ({ ...prev, [questionId]: true }))
    try {
      const res = await fetch(
        `/api/products/${productId}/questions/${questionId}/answers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            answer: answerTexts[questionId].trim(),
          }),
        }
      )
      const data = await res.json()
      if (data.success) {
        setAnswerTexts((prev) => ({ ...prev, [questionId]: '' }))
        toast({ title: 'Answer posted!', description: 'Your answer has been submitted.' })
        fetchQuestions()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to post answer', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to post answer', variant: 'destructive' })
    } finally {
      setSubmittingAnswers((prev) => ({ ...prev, [questionId]: false }))
    }
  }

  // Count totals
  const allQuestionsList = allQuestions.flatMap((pq) => pq.questions)
  const unansweredCount = allQuestionsList.filter((q) => !q.isAnswered).length

  const filterQuestions = (unansweredOnly: boolean): ProductWithQuestions[] => {
    return allQuestions
      .map((pq) => ({
        ...pq,
        questions: unansweredOnly
          ? pq.questions.filter((q) => !q.isAnswered)
          : pq.questions,
      }))
      .filter((pq) => pq.questions.length > 0)
  }

  const renderQuestionList = (products: ProductWithQuestions[]) => {
    if (products.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          <MessageCircleQuestion size={40} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-medium">No questions found</p>
          <p className="text-sm mt-1">
            {activeTab === 'unanswered'
              ? 'All questions have been answered. Great job!'
              : 'No questions have been asked for your products yet.'}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
        {products.map((pq) => (
          <Card key={pq.productId} className="border shadow-sm">
            <CardContent className="p-4">
              {/* Product header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {pq.productImage ? (
                    <img
                      src={pq.productImage}
                      alt={pq.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package size={14} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="font-medium text-sm truncate">{pq.productName}</span>
                <Badge variant="secondary" className="text-xs ml-auto flex-shrink-0">
                  {pq.questions.length} question{pq.questions.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <Separator className="mb-3" />

              {/* Questions */}
              <div className="space-y-3">
                {pq.questions.map((question) => {
                  const isExpanded = expandedQuestions.has(question.id)
                  const answers = question.answers || []

                  return (
                    <div key={question.id} className="rounded-md border bg-card">
                      {/* Question */}
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className="w-full text-left p-3 hover:bg-muted/30 transition-colors rounded-md"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {question.isAnswered ? (
                              <CheckCircle2 size={16} className="text-amber-500" />
                            ) : (
                              <Circle size={16} className="text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Avatar className="h-5 w-5">
                                {question.user?.avatar ? (
                                  <AvatarImage src={question.user.avatar} alt={question.user.name} />
                                ) : (
                                  <AvatarFallback className="text-[8px]">
                                    <User size={8} />
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <span className="text-xs font-medium">{question.user?.name || 'Anonymous'}</span>
                              <span className="text-xs text-muted-foreground">{formatDate(question.createdAt)}</span>
                            </div>
                            <p className="text-sm mt-1 leading-relaxed">{question.question}</p>
                            {answers.length > 0 && (
                              <span className="text-xs text-muted-foreground mt-1 inline-block">
                                {answers.length} answer{answers.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex-shrink-0 mt-0.5">
                            {isExpanded ? (
                              <ChevronUp size={14} className="text-muted-foreground" />
                            ) : (
                              <ChevronDown size={14} className="text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded: answers + form */}
                      {isExpanded && (
                        <div className="px-3 pb-3">
                          <Separator className="mb-2" />
                          {/* Existing answers */}
                          {answers.length > 0 && (
                            <div className="space-y-2 mb-3 ml-4">
                              {answers.map((answer) => (
                                <div key={answer.id} className="p-2 rounded bg-muted/30">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Avatar className="h-5 w-5">
                                      {answer.user?.avatar ? (
                                        <AvatarImage src={answer.user.avatar} alt={answer.user.name} />
                                      ) : (
                                        <AvatarFallback className="text-[8px]">
                                          <User size={8} />
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                    <span className="text-xs font-medium">{answer.user?.name || 'Anonymous'}</span>
                                    {answer.isSellerAnswer && (
                                      <Badge className="text-[10px] px-1.5 py-0 bg-amber-600 text-gray-900 hover:bg-amber-600">
                                        Seller
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(answer.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-1 leading-relaxed">{answer.answer}</p>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <ThumbsUp size={10} />
                                    <span>{answer.helpfulCount} helpful</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Answer form */}
                          <div className="space-y-2 ml-4">
                            <Textarea
                              placeholder="Write your answer..."
                              value={answerTexts[question.id] || ''}
                              onChange={(e) =>
                                setAnswerTexts((prev) => ({
                                  ...prev,
                                  [question.id]: e.target.value,
                                }))
                              }
                              rows={2}
                              className="resize-none text-sm"
                            />
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                onClick={() => handlePostAnswer(pq.productId, question.id)}
                                disabled={
                                  !answerTexts[question.id]?.trim() ||
                                  submittingAnswers[question.id]
                                }
                                className="gap-1.5"
                              >
                                {submittingAnswers[question.id] ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Send size={12} />
                                )}
                                Post Answer
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">Q&A Management</h2>
        {unansweredCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {unansweredCount} unanswered
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unanswered" className="gap-1.5">
            <Circle size={12} className="text-amber-500" />
            Unanswered
            {unansweredCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {unansweredCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5">
            <MessageCircleQuestion size={12} />
            All Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unanswered" className="mt-4">
          {renderQuestionList(filterQuestions(true))}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          {renderQuestionList(filterQuestions(false))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
