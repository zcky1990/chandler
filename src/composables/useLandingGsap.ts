import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const REDUCED = '(prefers-reduced-motion: reduce)'

function delayFromEl(el: HTMLElement): number {
  const m = el.className.match(/landing-delay-(\d)/)
  return m ? parseInt(m[1]) * 0.1 : 0
}

function staggerFromEl(el: HTMLElement): number {
  return parseFloat(el.style.getPropertyValue('--i')) * 0.06 || 0
}

export function useLandingGsap() {
  let ctx: gsap.Context | null = null
  let mm: gsap.MatchMedia | null = null

  onMounted(() => {
    mm = gsap.matchMedia()

    mm.add(REDUCED, () => {
      gsap.set('.landing-fade-in, .landing-fade-up, .landing-stagger, .landing-scale-in', {
        opacity: 1,
        clearProps: 'transform',
      })
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      ctx = gsap.context(() => {
        const sel = '.landing-fade-in, .landing-fade-up, .landing-stagger, .landing-scale-in'

        gsap.set(sel, { opacity: 0 })
        gsap.set('.landing-fade-up, .landing-stagger', { y: 24 })
        gsap.set('.landing-scale-in', { scale: 0.95 })

        const els = document.querySelectorAll<HTMLElement>(sel)
        els.forEach((el) => {
          const delay = delayFromEl(el)
          const stagger = staggerFromEl(el)
          const isStagger = el.classList.contains('landing-stagger')
          const isScale = el.classList.contains('landing-scale-in')
          const isFadeUp = el.classList.contains('landing-fade-up')
          const isFadeIn = el.classList.contains('landing-fade-in')

          const vars: gsap.TweenVars = {
            opacity: 1,
            duration: isStagger ? 0.45 : 0.5,
            delay: delay + stagger,
            ease: 'power2.out',
            overwrite: 'auto',
          }

          if (isFadeUp || isStagger) vars.y = 0
          if (isScale) vars.scale = 1

          ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => gsap.to(el, vars),
            once: true,
          })
        })
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
    mm?.revert()
  })
}
