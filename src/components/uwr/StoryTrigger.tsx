import { forwardRef } from 'react'
import type { StoryStateData } from '@/lib/uwr-stage'

export const StoryTrigger = forwardRef<HTMLDivElement, { step: StoryStateData }>(
  function StoryTrigger({ step }, ref) {
    return <div ref={ref} className="storyTrigger" data-trigger-id={step.id} />
  },
)
