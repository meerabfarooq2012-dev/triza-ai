'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MessageCircleQuestion,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Send,
  Loader2,
  MessageSquare,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { useToast } from '@/hooks/use-toast'
import type { ProductQuestion, ProductAnswer } from '@/types'

interface ProductQAProps {
  productId: string
  shopOwnerId?: string
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

export function ProductQA({ productId, shopOwnerId }: ProductQAProps) {
  const { currentUser } = useMarketplaceStore()
  const { toast } = useToast()

  const [questions, setQuestions] = useState<ProductQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [questionText, setQuestionText] = useState('')
  const [submittingQuestion, setSubmittingQuestion] = useState(false)
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({})
  const [submittingAnswers, setSubmittingAnswers] = useState<Record<string, boolean>>({})
  const [helpfulLoading, setHelpfulLoading] = useState<Record<string, boolean>>({})

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/products/${productId}/questions`)
      const data = await res.json()
      if (data.success && data.data?.questions) {
        setQuestions(data.data.questions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }, [productId])

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

  const handleAskQuestion = async () => {
    if (!currentUser || !questionText.trim()) return
    setSubmittingQuestion(true)
    try {
      const res = await fetch(`/api/products/${productId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          question: questionText.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setQuestionText('')
        toast({ title: 'Question posted!', description: 'Your question has been submitted.' })
        fetchQuestions()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to post question', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to post question', variant: 'destructive' })
    } finally {
      setSubmittingQuestion(false)
    }
  }

  const handlePostAnswer = async (questionId: string) => {
    if (!currentUser || !answerTexts[questionId]?.trim()) return
    setSubmittingAnswers((prev) => ({ ...prev, [questionId]: true }))
    try {
      const res = await fetch(`/api/products/${productId}/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          answer: answerTexts[questionId].trim(),
        }),
      })
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

  const handleMarkHelpful = async (questionId: string, answerId: string) => {
    if (!currentUser || helpfulLoading[answerId]) return
    setHelpfulLoading((prev) => ({ ...prev, [answerId]: true }))
    try {
      const res = await fetch(
        `/api/products/${productId}/questions/${questionId}/answers/${answerId}/helpful`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id }),
        }
      )
      const data = await res.json()
      if (data.success) {
        // Optimistically update the helpful count in the local state
        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id !== questionId) return q
            return {
              ...q,
              answers: q.answers?.map((a) =>
                a.id === answerId ? { ...a, helpfulCount: a.helpfulCount + 1 } : a
              ),
            }
          })
        )
      }
    } catch {
      // Silent fail for helpful marking
    } finally {
      setHelpfulLoading((prev) => ({ ...prev, [answerId]: false }))
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircleQuestion size={20} className="text-emerald-600" />
            Questions & Answers
            {questions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {questions.length}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ask a Question Form */}
        {currentUser && (
          <div className="space-y-3">
            <Textarea
              placeholder="Ask a question about this product..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {questionText.length}/1000 characters
              </span>
              <Button
                size="sm"
                onClick={handleAskQuestion}
                disabled={!questionText.trim() || submittingQuestion}
                className="gap-1.5"
              >
                {submittingQuestion ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Ask Question
              </Button>
            </div>
          </div>
        )}

        {!currentUser && (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            <MessageSquare size={20} className="mx-auto mb-2 text-muted-foreground/50" />
            <p>Log in to ask a question or post an answer.</p>
          </div>
        )}

        <Separator />

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <MessageCircleQuestion size={40} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">No questions yet</p>
            <p className="text-sm mt-1">Be the first to ask about this product!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {questions.map((question) => {
              const isExpanded = expandedQuestions.has(question.id)
              const answers = question.answers || []
              const answerCount = answers.length

              return (
                <div
                  key={question.id}
                  className="rounded-lg border bg-card"
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleQuestion(question.id)}
                    className="w-full text-left p-4 hover:bg-muted/30 transition-colors rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                        {question.user?.avatar ? (
                          <AvatarImage src={question.user.avatar} alt={question.user.name} />
                        ) : (
                          <AvatarFallback className="text-xs">
                            <User size={14} />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{question.user?.name || 'Anonymous'}</span>
                          <Badge
                            variant={question.isAnswered ? 'default' : 'secondary'}
                            className={`text-[10px] px-1.5 py-0 ${
                              question.isAnswered
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                            }`}
                          >
                            {question.isAnswered ? 'Answered' : 'Unanswered'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {answerCount} answer{answerCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm mt-1 leading-relaxed">{question.question}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <span>{formatDate(question.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-muted-foreground" />
                        ) : (
                          <ChevronDown size={16} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Answers */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <Separator className="mb-3" />
                      {answers.length > 0 ? (
                        <div className="space-y-3 ml-6">
                          {answers.map((answer) => (
                            <div
                              key={answer.id}
                              className="flex items-start gap-3 p-3 rounded-md bg-muted/30"
                            >
                              <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
                                {answer.user?.avatar ? (
                                  <AvatarImage src={answer.user.avatar} alt={answer.user.name} />
                                ) : (
                                  <AvatarFallback className="text-[10px]">
                                    <User size={12} />
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm">{answer.user?.name || 'Anonymous'}</span>
                                  {answer.isSellerAnswer && (
                                    <Badge className="text-[10px] px-1.5 py-0 bg-emerald-600 text-white hover:bg-emerald-600">
                                      Seller
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm mt-1 leading-relaxed">{answer.answer}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <button
                                    onClick={() => handleMarkHelpful(question.id, answer.id)}
                                    disabled={helpfulLoading[answer.id] || !currentUser}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 transition-colors disabled:opacity-50"
                                  >
                                    <ThumbsUp size={12} />
                                    <span>Helpful ({answer.helpfulCount})</span>
                                  </button>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(answer.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground ml-6 py-2">
                          No answers yet. Be the first to answer!
                        </p>
                      )}

                      {/* Answer Form */}
                      {currentUser && (
                        <div className="mt-3 ml-6 space-y-2">
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
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {(answerTexts[question.id] || '').length}/2000
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handlePostAnswer(question.id)}
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
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
