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
  onHoverChange: (id: string | null) => void
}

export function ExplainerStage({ step, activeId, hoveredId, enhanced, onHoverChange }: Props) {
  const explored = uwrHotspots.find(point => point.id === hoveredId)
  return <div className="explainerStage">
    <InteractiveImage image={uwrScenes.positions} hotspots={uwrHotspots} activeId={activeId}
      camera={step.camera} animateCamera={enhanced} onHoverChange={onHoverChange} />
    <div className="explainerStage__shade" aria-hidden="true" />
    <div className="explainerStage__copy" aria-hidden="true">
      <StoryCopy key={step.id} state={step} decorative />
    </div>
    {explored && <div className="stageExploration" aria-hidden="true">
      <strong>{explored.label}</strong><p>{explored.description}</p>
    </div>}
  </div>
}
