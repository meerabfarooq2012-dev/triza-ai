'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MessageCircleQuestion,
  ChevronDown,
  ThumbsUp,
  Send,
  Loader2,
  MessageSquare,
  User,
  HelpCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/skeleton'
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
      // Silent fail
    } finally {
      setHelpfulLoading((prev) => ({ ...prev, [answerId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="space-y-3">
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header — Fiverr style */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <HelpCircle size={22} className="text-emerald-600" />
          Questions & Answers
          {questions.length > 0 && (
            <Badge variant="secondary" className="font-normal">
              {questions.length}
            </Badge>
          )}
        </h2>
      </div>

      {/* Ask a Question — prominent input at top */}
      {currentUser ? (
        <Card className="border-0 shadow-sm bg-emerald-50/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <MessageCircleQuestion size={16} />
              Have a question about this product?
            </div>
            <Textarea
              placeholder="Type your question here..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={2}
              className="resize-none bg-white"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {questionText.length}/1000 characters
              </span>
              <Button
                size="sm"
                onClick={handleAskQuestion}
                disabled={!questionText.trim() || submittingQuestion}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {submittingQuestion ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Ask Question
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm bg-gray-50">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            <MessageSquare size={20} className="mx-auto mb-2 text-muted-foreground/50" />
            <p>Log in to ask a question or post an answer.</p>
          </CardContent>
        </Card>
      )}

      {/* Questions List — Fiverr FAQ accordion style */}
      {questions.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <MessageCircleQuestion size={40} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium">No questions yet</p>
          <p className="text-sm mt-1">Be the first to ask about this product!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((question) => {
            const isExpanded = expandedQuestions.has(question.id)
            const answers = question.answers || []
            const answerCount = answers.length
            const sellerAnswer = answers.find((a) => a.isSellerAnswer)

            return (
              <div
                key={question.id}
                className="rounded-lg border bg-card overflow-hidden transition-colors"
              >
                {/* Question — clickable accordion header */}
                <button
                  onClick={() => toggleQuestion(question.id)}
                  className="w-full text-left p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        question.isAnswered
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        <HelpCircle size={14} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-relaxed">{question.question}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {question.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(question.createdAt)}
                        </span>
                        {question.isAnswered ? (
                          <Badge className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Answered
                          </Badge>
                        ) : (
                          <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 hover:bg-amber-100">
                            Pending
                          </Badge>
                        )}
                        {answerCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {answerCount} answer{answerCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {/* Show seller answer preview when collapsed */}
                      {!isExpanded && sellerAnswer && (
                        <div className="mt-2 flex items-start gap-2">
                          <Badge className="text-[9px] px-1 py-0 bg-emerald-600 text-white hover:bg-emerald-600 shrink-0">
                            Seller
                          </Badge>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {sellerAnswer.answer}
                          </p>
                        </div>
                      )}
                    </div>
                    <ChevronDown
                      size={16}
                      className={`flex-shrink-0 mt-1 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Answers */}
                {isExpanded && (
                  <div className="border-t">
                    <div className="p-4 space-y-3">
                      {answers.length > 0 ? (
                        answers.map((answer) => (
                          <div
                            key={answer.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/40"
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
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(answer.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm mt-1 leading-relaxed">{answer.answer}</p>
                              <button
                                onClick={() => handleMarkHelpful(question.id, answer.id)}
                                disabled={helpfulLoading[answer.id] || !currentUser}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 transition-colors disabled:opacity-50 mt-1.5"
                              >
                                <ThumbsUp size={11} />
                                <span>Helpful ({answer.helpfulCount})</span>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground ml-9 py-2">
                          No answers yet. Be the first to answer!
                        </p>
                      )}

                      {/* Answer Form */}
                      {currentUser && (
                        <div className="ml-9 space-y-2 pt-2">
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
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
