import { Link } from 'react-router-dom'
import {
  Check, X, Sparkles, Shield, Zap,
  Clock, Infinity, Wallet, ArrowRight, Star
} from 'lucide-react'

export default function Pricing() {

  // --- PRICING DATA ---
  const tiers = [
    {
      name: 'Flex Pack',
      id: 'tier-flex',
      href: '/signup?plan=flex',
      price: '$19',
      period: '/ ONE-TIME',
      description: 'Buy credits. Use anytime. Never expires.',
      features: [
        '5 Premium Sessions',
        'Vision + Speech Analysis',
        'Tech Lead & Exec Personas',
        'Lifetime History Access',
        'No Expiration Date',
      ],
      cta: 'Get Credits',
      popular: false,
      color: 'bg-[#111] border-white/10 text-white',
      btnColor: 'bg-white text-black hover:bg-gray-200'
    },
    {
      name: '7-Day Sprint',
      id: 'tier-sprint',
      href: '/signup?plan=sprint',
      price: '$29',
      period: '/ ONE-TIME',
      description: 'Unlimited access for 1 week. Total crunch mode.',
      features: [
        'UNLIMITED Sessions',
        'Priority Processing',
        'All Scenarios Unlocked',
        'Deep Analytics Report',
        'Session Recordings',
        'Valid for 7 Days',
      ],
      cta: 'Start Sprint',
      popular: true,
      badge: 'INTERVIEW NEXT WEEK?',
      color: 'bg-indigo-600 border-indigo-500 text-white',
      btnColor: 'bg-black text-white hover:bg-gray-900'
    },
    {
      name: 'Free Trial',
      id: 'tier-free',
      href: '/',
      price: '$0',
      period: '/ FOREVER',
      description: 'Test the engine before committing.',
      features: [
        '1 Session / Month',
        'Basic Speech Metrics',
        'Standard HR Persona',
        'Real-time Feedback',
      ],
      notIncluded: [
        'No Session Recording',
        'No Vision Analysis',
        'No Custom Roles'
      ],
      cta: 'Try Demo',
      popular: false,
      color: 'bg-[#0a0a0a] border-white/5 text-gray-400',
      btnColor: 'bg-white/10 text-white hover:bg-white/20'
    },
  ]

  // --- FAQ DATA ---
  const faqs = [
    {
      question: "IS THIS A SUBSCRIPTION?",
      answer: "No. We hate recurring fees. You pay once, you use it. No hidden charges on your credit card next month."
    },
    {
      question: "DO CREDITS EXPIRE?",
      answer: "Never. Buy a Flex Pack today, use the last credit 2 years from now. They sit in your account until you need them."
    },
    {
      question: "WHAT HAPPENS AFTER 7 DAYS?",
      answer: "For the Sprint pass, you lose access to starting *new* sessions, but your history and reports remain accessible forever."
    },
    {
      question: "CAN I GET A REFUND?",
      answer: "Yes. If you complete a session and don't feel the value, email us within 24 hours for a full refund."
    },
  ]

  return (
    <div className="min-h-screen bg-[#030303] font-sans text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">

      {/* GLOBAL NOISE TEXTURE */}
      <div className="fixed inset-0 z-[60] pointer-events-none opacity-[0.05] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }}>
      </div>

      {/* 1. HEADER SECTION */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden border-b border-white/10 bg-[#050505]">

        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/80">Zero Subscriptions</span>
          </div>

          <h1 className="text-[10vw] md:text-[6vw] font-black tracking-tighter leading-[0.9] text-white uppercase mb-6">
            Pay only when <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-indigo-600">You Need It.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-400 font-medium">
            Whether you have an interview tomorrow or just want to stay sharp. <br/>
            No monthly commitments. Just pure performance.
          </p>
        </div>
      </div>

      {/* 2. PRICING CARDS */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8 items-start">

          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-[2.5rem] p-8 xl:p-10 transition-all duration-500 border h-full group ${tier.color} ${tier.popular ? 'scale-105 shadow-[0_0_50px_rgba(79,70,229,0.3)] z-10' : 'hover:border-white/20 hover:bg-[#161616]'}`}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-max rounded-full px-4 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest border border-indigo-500 shadow-xl flex items-center gap-2">
                  <Star size={12} className="fill-white" />
                  {tier.badge}
                </div>
              )}

              <div className="mb-8 mt-2">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-black uppercase tracking-tight">{tier.name}</h3>
                    {tier.id === 'tier-flex' && <Wallet className="text-white/50"/>}
                    {tier.id === 'tier-sprint' && <Infinity className="text-white"/>}
                </div>

                <p className={`text-sm font-medium leading-6 mb-8 ${tier.popular ? 'text-white/80' : 'text-gray-500'}`}>
                  {tier.description}
                </p>

                <div className="flex items-baseline gap-x-2">
                  <span className="text-6xl font-black tracking-tighter">
                    {tier.price}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${tier.popular ? 'text-white/60' : 'text-gray-600'}`}>
                    {tier.period}
                  </span>
                </div>
              </div>

              <a
                href={tier.href}
                className={`block rounded-xl py-4 px-3 text-center text-sm font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${tier.btnColor}`}
              >
                {tier.cta}
              </a>

              <ul role="list" className="mt-8 space-y-4 text-sm leading-6 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3 items-start">
                    <div className={`p-0.5 rounded-full ${tier.popular ? 'bg-white text-indigo-600' : 'bg-white/10 text-white'}`}>
                        <Check className="h-3 w-3 flex-none" strokeWidth={4} />
                    </div>
                    <span className="font-bold opacity-90">{feature}</span>
                  </li>
                ))}
                {tier.notIncluded?.map((feature) => (
                  <li key={feature} className="flex gap-x-3 items-start opacity-40">
                    <X className="h-5 w-5 flex-none" />
                    <span className="font-medium decoration-slice line-through">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TRUST & FAQ SECTION */}
      <div className="bg-[#050505] border-t border-white/10 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">

          <div className="mx-auto max-w-4xl text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase mb-4">
              Protocol <span className="text-indigo-500">Details.</span>
            </h2>
            <p className="text-gray-500 font-medium">Everything you need to know about the system.</p>
          </div>

          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {faqs.map((faq, index) => (
              <div key={index} className="border-l-2 border-white/10 pl-6 hover:border-indigo-500 transition-colors duration-300 group">
                <dt>
                  <h3 className="text-lg font-black uppercase leading-7 text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {faq.question}
                  </h3>
                </dt>
                <dd className="text-base leading-7 text-gray-400 font-medium">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </div>

          {/* MONEY BACK GUARANTEE (Industrial Card) */}
          <div className="mt-24 flex justify-center">
             <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/10 max-w-3xl text-center flex flex-col items-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)] relative z-10">
                    <Shield size={32} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase mb-2 relative z-10">100% Satisfaction Guarantee</h3>
                <p className="text-gray-400 font-medium relative z-10 max-w-lg">
                    If you buy a Flex Pack or Sprint Pass and don't feel more confident after your first session, we'll refund you in full. No questions asked.
                </p>
             </div>
          </div>

        </div>
      </div>

      <footer className="bg-black border-t border-white/10 py-12 text-center text-xs font-mono text-gray-600">
        © 2026 CANDID AI. SYSTEM OPTIMIZED.
      </footer>

    </div>
  )
}