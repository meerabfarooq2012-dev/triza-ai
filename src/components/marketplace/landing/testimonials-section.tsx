'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Digital Product Seller',
    initials: 'SJ',
    quote: 'Marketo made it incredibly easy to set up my online store. I was selling my design templates within minutes, and the analytics help me understand my customers better.',
    rating: 5,
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Marcus Chen',
    role: 'Freelance Developer',
    initials: 'MC',
    quote: 'As a freelancer, I needed a platform where I could showcase my services professionally. Marketo gave me exactly that — a beautiful storefront with built-in order management.',
    rating: 5,
    color: 'from-rose-500 to-pink-600',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Happy Buyer',
    initials: 'ER',
    quote: 'I love shopping on Marketo! The variety of products is amazing, and I feel secure with the buyer protection. Tracking my orders is seamless and hassle-free.',
    rating: 4,
    color: 'from-emerald-500 to-teal-600',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied users who trust Marketo for their online business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <Card className="h-full border-border/50 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  {/* Quote icon */}
                  <Quote className="h-8 w-8 text-violet-200 dark:text-violet-800 mb-4" />

                  {/* Quote text */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className={`h-4 w-4 ${
                          starIdx < testimonial.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>

                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${testimonial.color} text-white text-sm font-bold`}>
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
