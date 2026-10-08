'use client'

import { useEffect, useRef, useState } from 'react'
import { ExplainerStage } from './uwr/ExplainerStage'
import { StoryLinear } from './uwr/StoryLinear'
import { StoryTrigger } from './uwr/StoryTrigger'
import { StoryTranscript } from './uwr/StoryTranscript'
import { uwrStageSteps } from '@/lib/uwr-stage'

export function UwrExplainer() {
  const [enhanced, setEnhanced] = useState(false)
  const [scrollStepId, setScrollStepId] = useState(uwrStageSteps[0].id)
  const [scrollActiveId, setScrollActiveId] = useState<string | null>(uwrStageSteps[0].id)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const triggerRefs = useRef<(HTMLDivElement | null)[]>([])
  const storyRef = useRef<HTMLElement>(null)
  const activeStep = uwrStageSteps.find(step => step.id === scrollStepId) ?? uwrStageSteps[0]
  const activeId = hoveredId ?? scrollActiveId

  useEffect(() => {
    // Avoid cropping key objects on unusually tall or ultra-wide viewports.
    const desktop = window.matchMedia('(min-width: 768px) and (min-height: 600px) and (min-aspect-ratio: 4/5) and (max-aspect-ratio: 5/2)')
    const mobile = window.matchMedia('(max-width: 767px) and (min-height: 500px)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      const nextEnhanced = (desktop.matches || mobile.matches) && !reduced.matches && 'IntersectionObserver' in window
      setEnhanced(nextEnhanced)
      setScrollStepId(uwrStageSteps[0].id)
      setScrollActiveId(nextEnhanced ? uwrStageSteps[0].id : null)
      setHoveredId(null)
    }
    update()
    desktop.addEventListener('change', update)
    mobile.addEventListener('change', update)
    reduced.addEventListener('change', update)
    return () => { desktop.removeEventListener('change', update); mobile.removeEventListener('change', update); reduced.removeEventListener('change', update) }
  }, [])

  useEffect(() => {
    if (!enhanced) return
    let observer: IntersectionObserver
    const select = (index: number) => {
      const step = uwrStageSteps[index]
      setScrollStepId(step.id)
      setScrollActiveId(step.id)
      setHoveredId(null)
    }
    const clamp = () => {
      const rect = storyRef.current?.getBoundingClientRect()
      if (!rect) return
      if (rect.top > 0) select(0)
      else if (rect.bottom <= window.innerHeight) select(uwrStageSteps.length - 1)
    }
    const update = () => {
      // Top two-pixel band: every trigger owns its full scroll interval.
      // The last state stays selected while the stage releases toward the CTA.
      observer?.disconnect()
      observer = new IntersectionObserver(entries => {
        const entry = entries.find(item => item.isIntersecting)
        if (!entry) return
        const index = triggerRefs.current.indexOf(entry.target as HTMLDivElement)
        if (index >= 0) select(index)
      }, { rootMargin: `0px 0px -${Math.max(0, window.innerHeight - 2)}px 0px`, threshold: 0 })
      triggerRefs.current.forEach(element => { if (element) observer.observe(element) })
      clamp()
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', clamp, { passive: true })
    return () => { observer.disconnect(); window.removeEventListener('resize', update); window.removeEventListener('scroll', clamp) }
  }, [enhanced])

  useEffect(() => {
    const story = storyRef.current
    if (!enhanced || !story) return
    const introduction = story.previousElementSibling
    const conclusion = story.nextElementSibling
    let transitionTarget: number | null = null
    let transitionDeadline = 0
    let settlingTransition = false
    let lockedUntil = 0
    let lastWheelAt = -Infinity
    const transitionTo = (top: number) => {
      transitionTarget = Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight))
      transitionDeadline = performance.now() + 1500
      settlingTransition = true
      window.scrollTo({ top: transitionTarget, behavior: 'smooth' })
    }
    const wheel = (event: WheelEvent) => {
      if (window.matchMedia('(max-width: 767px)').matches) return
      if (event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey
        || event.deltaY === 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      // Track the entire gesture, including momentum arriving in another panel.
      const now = performance.now()
      const continuingGesture = now - lastWheelAt < 180
      lastWheelAt = now
      const rect = story.getBoundingClientRect()
      const target = event.target instanceof Node ? event.target : null
      const inIntroduction = !!target && !!introduction?.contains(target)
      const inStory = !!target && story.contains(target)
      const inConclusion = !!target && !!conclusion?.contains(target)
      if (!inIntroduction && !inStory && !inConclusion) return
      if (transitionTarget !== null) {
        if (Math.abs(window.scrollY - transitionTarget) <= 2 || now >= transitionDeadline) {
          transitionTarget = null
        } else {
          event.preventDefault()
          return
        }
      }
      // Once the camera has arrived, absorb the rest of that same gesture,
      // but allow a fresh gesture to navigate back immediately.
      if (settlingTransition) {
        if (continuingGesture) {
          event.preventDefault()
          return
        }
        settlingTransition = false
      }
      if (inIntroduction && event.deltaY > 0 && rect.top > 1) {
        event.preventDefault()
        transitionTo(window.scrollY + rect.top + 2)
        return
      }
      if (inConclusion && event.deltaY < 0) {
        event.preventDefault()
        transitionTo(window.scrollY + rect.bottom - window.innerHeight)
        return
      }
      // Hero upwards and CTA downwards remain native, including footer access.
      if (!inStory) return
      // Also settle partially visible panels reached via scrollbar or keyboard.
      if (rect.top > 1 || rect.bottom < window.innerHeight - 1) {
        let destination: number | null
        if (rect.top > 1) {
          destination = event.deltaY > 0 ? window.scrollY + rect.top + 2
            : introduction ? window.scrollY + introduction.getBoundingClientRect().top : null
        } else {
          destination = event.deltaY < 0 ? window.scrollY + rect.bottom - window.innerHeight
            : conclusion ? window.scrollY + conclusion.getBoundingClientRect().top : null
        }
        if (destination !== null) {
          event.preventDefault()
          transitionTo(destination)
        }
        return
      }
      if (now < lockedUntil || continuingGesture) {
        event.preventDefault()
        return
      }
      let index = 0
      triggerRefs.current.forEach((element, candidate) => {
        if (element && element.getBoundingClientRect().top <= 2) index = candidate
      })
      const nextIndex = index + Math.sign(event.deltaY)
      if (nextIndex < 0 || nextIndex >= uwrStageSteps.length) {
        const destination = nextIndex < 0 ? introduction : conclusion
        if (!destination) return
        event.preventDefault()
        if (nextIndex >= uwrStageSteps.length) {
          // Align the invisible last interval before leaving. The sticky image
          // stays identical, so the visible fullscreen transition starts now.
          window.scrollTo({ top: window.scrollY + rect.bottom - window.innerHeight, behavior: 'instant' })
        }
        transitionTo(window.scrollY + destination.getBoundingClientRect().top)
        return
      }
      const next = triggerRefs.current[nextIndex]
      if (!next) return
      event.preventDefault()
      // Keep one gesture to one object, including trackpad momentum. The SVG
      // camera completes its 750ms eased flight instead of following wheel ticks.
      lockedUntil = now + 800
      window.scrollTo({ top: window.scrollY + next.getBoundingClientRect().top + 2, behavior: 'instant' })
    }
    window.addEventListener('wheel', wheel, { passive: false })
    return () => window.removeEventListener('wheel', wheel)
  }, [enhanced])

  useEffect(() => {
    const reset = () => setHoveredId(null)
    const visibility = () => { if (document.hidden) reset() }
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', visibility)
    return () => { window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', visibility) }
  }, [])

  return (
    <section ref={storyRef} id="uwr-ball" className="explainerStory" aria-label="Unterwasserrugby entdecken"
      data-enhanced={enhanced} data-state={activeStep.id} data-step={activeStep.id}
      data-scroll-active-id={scrollActiveId ?? ''} data-active-id={activeId ?? ''} data-hovered-id={hoveredId ?? ''}>
      <ExplainerStage step={activeStep} activeId={activeId} hoveredId={hoveredId}
        enhanced={enhanced} onHoverChange={setHoveredId} />
      <div className="scrollDriver" aria-hidden="true" inert>
        {uwrStageSteps.map((step, index) => <StoryTrigger key={step.id} step={step}
          ref={element => { triggerRefs.current[index] = element }} />)}
      </div>
      <StoryTranscript enabled={enhanced} />
      <StoryLinear enabled={!enhanced} />
    </section>
  )
}
