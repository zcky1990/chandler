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

function parseCounterText(text: string): { value: number; suffix: string } {
  const m = text.match(/^([\d,]+)\s*(.*)$/)
  if (!m) return { value: 0, suffix: '' }
  return { value: parseInt(m[1].replace(/,/g, '')), suffix: m[2] }
}

export function useLandingGsap() {
  let ctx: gsap.Context | null = null
  let mm: gsap.MatchMedia | null = null

  onMounted(() => {
    mm = gsap.matchMedia()

    mm.add(REDUCED, () => {
      gsap.set('.landing-fade-in, .landing-fade-up, .landing-stagger, .landing-scale-in, .landing-text-reveal, .landing-hero-choreo > *, .landing-parallax, .landing-marquee', {
        opacity: 1,
        clearProps: 'transform',
      })
      gsap.set('.landing-counter', { opacity: 1 })
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      ctx = gsap.context(() => {
        // ── Existing fade/stagger animations ──
        const sel = '.landing-fade-in, .landing-fade-up, .landing-stagger, .landing-scale-in'
        gsap.set(sel, { opacity: 0 })
        gsap.set('.landing-fade-up, .landing-stagger', { y: 24 })
        gsap.set('.landing-scale-in', { scale: 0.95 })

        document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
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

        // ── Hero choreography ──
        document.querySelectorAll<HTMLElement>('.landing-hero-choreo').forEach((parent) => {
          const children = parent.children
          gsap.set(children, { opacity: 0, y: 30 })
          ScrollTrigger.create({
            trigger: parent,
            start: 'top 85%',
            onEnter: () => {
              gsap.to(children, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: 'power3.out',
                overwrite: 'auto',
              })
            },
            once: true,
          })
        })

        // ── Counter animations ──
        document.querySelectorAll<HTMLElement>('.landing-counter').forEach((el) => {
          const { value: target, suffix } = parseCounterText(el.textContent || '0')
          if (target === 0) return
          el.textContent = `0${suffix}`
          ScrollTrigger.create({
            trigger: el,
            start: 'top 90%',
            onEnter: () => {
              const start = { val: 0 }
              gsap.to(start, {
                val: target,
                duration: 2,
                ease: 'power2.out',
                onUpdate: () => {
                  el.textContent = `${Math.round(start.val)}${suffix}`
                },
                overwrite: 'auto',
              })
            },
            once: true,
          })
        })

        // ── Text split reveal ──
        document.querySelectorAll<HTMLElement>('.landing-text-reveal').forEach((el) => {
          const html = el.innerHTML
          const parts = html.split(/<br\s*\/?>/i)
          if (parts.length < 2) return

          el.innerHTML = ''
          const lines: HTMLElement[] = []
          parts.forEach((part, i) => {
            const wrap = document.createElement('div')
            wrap.className = 'landing-split-line'
            wrap.style.cssText = 'overflow:hidden;display:block'
            const inner = document.createElement('div')
            inner.className = 'landing-split-inner'
            inner.innerHTML = part.trim()
            inner.style.cssText = 'display:inline-block'
            wrap.appendChild(inner)
            el.appendChild(wrap)
            if (i < parts.length - 1) {
              el.appendChild(document.createTextNode(' '))
            }
            lines.push(inner)
          })

          gsap.set(lines, { y: 40, opacity: 0 })
          ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            onEnter: () => {
              gsap.to(lines, {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out',
                overwrite: 'auto',
              })
            },
            once: true,
          })
        })

        // ── Parallax ──
        document.querySelectorAll<HTMLElement>('.landing-parallax').forEach((el) => {
          gsap.to(el, {
            y: () => el.dataset.parallaxDistance
              ? parseFloat(el.dataset.parallaxDistance)
              : window.innerHeight * 0.15,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement || el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          })
        })

        // ── Marquee ──
        document.querySelectorAll<HTMLElement>('.landing-marquee').forEach((el) => {
          const inner = el.firstElementChild as HTMLElement | null
          if (!inner) return
          const clone = inner.cloneNode(true) as HTMLElement
          el.appendChild(clone)
          const w = inner.offsetWidth
          gsap.to([inner, clone], {
            xPercent: -100,
            ease: 'none',
            repeat: -1,
            duration: w / 50,
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              toggleActions: 'play pause reverse pause',
            },
          })
        })

        // ── Scroll progress bar ──
        const progressBar = document.querySelector<HTMLElement>('.landing-scroll-progress')
        if (progressBar) {
          gsap.to(progressBar, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: document.body,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
          })
        }
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
    mm?.revert()
  })
}
