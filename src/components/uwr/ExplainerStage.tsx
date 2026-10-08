'use client'

import { useLayoutEffect, useRef } from 'react'
import { InteractiveImage } from './InteractiveImage'
import { StoryCopy } from './StoryCopy'
import { uwrScenes } from '@/lib/uwr-explainer'
import { uwrHotspots } from '@/lib/uwr-hotspots'
import type { StoryStateData } from '@/lib/uwr-stage'

type Props = {
  step: StoryStateData
  activeId: string | null
  hoveredId: string | null
  enhanced: boolean
  selectedId: string | null
  onActivate: (id: string) => void
  onHoverChange: (id: string | null) => void
}

export function ExplainerStage({ step, activeId, hoveredId, enhanced, selectedId, onActivate, onHoverChange }: Props) {
  const copyRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (copyRef.current) copyRef.current.scrollTop = 0
  }, [step.id])
  const explored = uwrHotspots.find(point => point.id === hoveredId)
  return <div className="explainerStage">
    <InteractiveImage image={uwrScenes.positions} hotspots={uwrHotspots} activeId={activeId}
      camera={step.camera} mobileCamera={step.mobileCamera} animateCamera={enhanced} selectedId={selectedId} onActivate={onActivate} onHoverChange={onHoverChange} />
    <div className="explainerStage__shade" aria-hidden="true" />
    <div ref={copyRef} className="explainerStage__copy" aria-hidden="true">
      <StoryCopy key={step.id} state={step} decorative />
    </div>
    {explored && !selectedId && <div className="stageExploration" aria-hidden={enhanced} aria-live={enhanced ? undefined : 'polite'}>
      <strong>{explored.label}</strong><p>{explored.description}</p>
    </div>}
  </div>
}
