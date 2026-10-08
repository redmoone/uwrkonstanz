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
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      const nextEnhanced = desktop.matches && !reduced.matches && 'IntersectionObserver' in window
      setEnhanced(nextEnhanced)
      setScrollStepId(uwrStageSteps[0].id)
      setScrollActiveId(nextEnhanced ? uwrStageSteps[0].id : null)
      setHoveredId(null)
    }
    update()
    desktop.addEventListener('change', update)
    reduced.addEventListener('change', update)
    return () => { desktop.removeEventListener('change', update); reduced.removeEventListener('change', update) }
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
