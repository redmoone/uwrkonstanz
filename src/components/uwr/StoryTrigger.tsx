import { forwardRef } from 'react'
import type { StoryTriggerData } from '@/lib/uwr-story'

export const StoryTrigger = forwardRef<HTMLDivElement, { step: StoryTriggerData }>(
  function StoryTrigger({ step }, ref) {
    return <div ref={ref} className={`storyTrigger${step.stateId === 'team' ? ' storyTrigger--team' : ''}`}
      data-trigger-id={step.id} />
  },
)
