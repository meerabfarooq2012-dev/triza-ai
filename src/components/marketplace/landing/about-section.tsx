'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Heart, Users, Briefcase, ShoppingBag, Globe, Sparkles, TrendingUp, Shield, Zap, Star } from 'lucide-react'

/* ── Floating gold particle component ─────────────────────────────────────── */
function GoldParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(245,158,11,${0.4 + Math.random() * 0.4}), transparent)`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2 + Math.random() * 0.5, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  )
}

/* ── Main AboutSection component ──────────────────────────────────────────── */
export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const motiveCardRef = useRef<HTMLDivElement>(null)

  /* Parallax scroll effect */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const parallaxY = useTransform(scrollYProgress, [0, 1], [40, -40])
  const parallaxY2 = useTransform(scrollYProgress, [0, 1], [20, -20])

  /* Subtle mouse-follow glow inside motive card */
  useEffect(() => {
    const card = motiveCardRef.current
    if (!card) return
    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }
    card.addEventListener('mousemove', handleMove)
    return () => card.removeEventListener('mousemove', handleMove)
  }, [])

  /* ── Feature card data ────────────────────────────────────────────────── */
  const motiveFeatures = [
    {
      icon: Globe,
      title: 'One Platform',
      description: 'Everything you need — buying, selling, freelancing — consolidated in one seamless experience.',
    },
    {
      icon: Shield,
      title: 'Trusted Space',
      description: 'A secure marketplace where every transaction is protected and every user is verified.',
    },
    {
      icon: TrendingUp,
      title: 'Growth Focused',
      description: 'Tools and insights designed to help individuals and small businesses scale and succeed.',
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-28 overflow-hidden bg-gray-100 dark:bg-slate-900/50"
    >
      {/* ── Gradient mesh background ──────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200/20 dark:bg-amber-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-100/30 dark:bg-amber-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gray-200/40 dark:bg-slate-800/30 rounded-full blur-3xl" />
      </div>

      {/* ── Light grey decorative elements ────────────────────────────────── */}
      {/* Horizontal decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute top-12 left-1/2 -translate-x-1/2 w-1/3 max-w-md h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"
      />

      {/* Decorative dots pattern — top right */}
      <div className="absolute top-8 right-8 sm:right-16 grid grid-cols-4 gap-2 opacity-20 dark:opacity-10">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
        ))}
      </div>

      {/* Decorative dots pattern — bottom left */}
      <div className="absolute bottom-8 left-8 sm:left-16 grid grid-cols-3 gap-2 opacity-20 dark:opacity-10">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── About Marketo ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-950/50 px-4 py-1.5 mb-6 text-sm text-amber-700 dark:text-amber-300 font-medium">
            <Heart className="h-3.5 w-3.5" />
            About Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            About{' '}
            <span className="gold-gradient-text bg-clip-text text-transparent">
              Marketo
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Marketo is an all-in-one modern marketplace where users can join as buyers, sellers, or both. Sellers can offer freelance services, sell digital and physical products, and create their own customizable online shop with a unique public URL. Buyers can easily hire freelancers and purchase products through a simple and secure system.
          </p>
        </motion.div>

        {/* ── Platform highlights ────────────────────────────────────────── */}
        <motion.div
          style={{ y: parallaxY2 }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20"
        >
          {[
            {
              icon: <Users className="h-6 w-6" />,
              title: 'Buyers & Sellers',
              description: 'Join as a buyer, seller, or both — the choice is yours.',
              gradient: 'from-amber-600 to-amber-500',
            },
            {
              icon: <Briefcase className="h-6 w-6" />,
              title: 'Freelancer Friendly',
              description: 'Offer services, find clients, and earn independently.',
              gradient: 'from-amber-500 to-amber-600',
            },
            {
              icon: <ShoppingBag className="h-6 w-6" />,
              title: 'Custom Shops',
              description: 'Create your own customizable shop with a unique public URL.',
              gradient: 'from-emerald-500 to-teal-600',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="text-center p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 backdrop-blur-sm"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-r ${item.gradient} p-3 text-white mb-4 shadow-lg`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Light grey stripe separator ────────────────────────────────── */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-20 mx-auto max-w-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
            <Sparkles className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          </div>
        </motion.div>

        {/* ── Our Motive — Premium Dark Card ─────────────────────────────── */}
        <motion.div
          ref={motiveCardRef}
          style={{ y: parallaxY }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Deep dark background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />

          {/* Animated gradient border overlay */}
          <div className="absolute inset-0 rounded-3xl">
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: `conic-gradient(from var(--border-angle, 0deg), transparent 60%, rgba(245,158,11,0.3) 75%, rgba(245,158,11,0.5) 80%, rgba(245,158,11,0.3) 85%, transparent 100%)`,
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
                padding: '2px',
                borderRadius: '1.5rem',
              }}
            />
          </div>

          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />

          {/* Gold accent lines — top and bottom */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          {/* Mouse-follow glow effect */}
          <div
            className="absolute w-64 h-64 rounded-full pointer-events-none transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Left gold glow */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />
          {/* Right gold glow */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />

          {/* Floating gold particles */}
          <GoldParticles />

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm px-4 py-1.5 mb-6"
            >
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Our Motive</span>
            </motion.div>

            {/* Heading — bright white for maximum contrast */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6"
            >
              Built for People Who{' '}
              <span className="gold-shimmer-text bg-clip-text text-transparent">
                Create
              </span>
            </motion.h3>

            {/* Description — light grey for readability on dark */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-gray-300 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
              Our motive is to build a simple and powerful marketplace where people can buy, sell, and work online easily. Marketo also supports freelancers by giving them a platform to offer services, find clients, and earn independently. It is designed to help individuals and small businesses grow and succeed in one trusted digital space.
            </motion.p>

            {/* Divider */}
            <div className="my-10 max-w-xs mx-auto">
              <div className="gold-divider" />
            </div>

            {/* Feature cards — enhanced from pills to proper cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto"
            >
              {motiveFeatures.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.12 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 30px rgba(245,158,11,0.15)',
                  }}
                  className="group relative p-5 sm:p-6 rounded-2xl border border-gray-700/60 dark:border-gray-700/60 bg-gray-800/40 dark:bg-gray-800/50 backdrop-blur-sm hover:border-amber-500/50 transition-colors duration-300 text-center cursor-default"
                >
                  {/* Subtle top border glow on hover */}
                  <div className="absolute top-0 left-1/4 right-1/4 h-px bg-amber-500/0 group-hover:bg-amber-500/60 transition-all duration-300 group-hover:left-1/6 group-hover:right-1/6" />

                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-700/50 group-hover:bg-amber-500/20 transition-colors duration-300 mb-3">
                    <item.icon className="h-5 w-5 text-gray-400 group-hover:text-amber-400 transition-colors duration-300" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-200 group-hover:text-amber-300 transition-colors duration-300 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Corner sparkle on hover */}
                  <Zap className="absolute top-2 right-2 h-3 w-3 text-amber-500/0 group-hover:text-amber-400/60 transition-all duration-300" />
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom decorative accent */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-10 flex items-center justify-center gap-1"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-amber-500/40"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom decorative line ──────────────────────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-1/3 max-w-md h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"
      />
    </section>
  )
}
