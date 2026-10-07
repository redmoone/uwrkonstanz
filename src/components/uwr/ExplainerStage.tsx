import { InteractiveImage } from './InteractiveImage'
import { StoryCopy } from './StoryCopy'
import type { StoryStateData, StoryTriggerData } from '@/lib/uwr-story'
import { DEBUG_HOTSPOTS } from '@/lib/uwr-hotspots'

type Props = {
  states: StoryStateData[]
  step: StoryTriggerData
  activeId: string | null
  enabled: boolean
  onHoverChange: (id: string | null) => void
}

export function ExplainerStage({ states, step, activeId, enabled, onHoverChange }: Props) {
  return <div className="explainerStage" aria-hidden={!enabled} inert={!enabled}>
    {states.map(state => {
      const selected = state.id === step.stateId
      const hotspots = DEBUG_HOTSPOTS ? state.hotspots : state.hotspots?.filter(point => point.id === step.hotspotId)
      return <div key={state.id} className={`stageLayer stageLayer--${state.placement}`} data-state-id={state.id}
        data-active={selected} aria-hidden={!selected} inert={!selected}>
        <div className="stageLayer__media">
          <InteractiveImage image={state.image} hotspots={selected ? hotspots : []}
            activeId={selected ? activeId : null} onHoverChange={onHoverChange}
            caption={state.image.alt} fullscreen />
        </div>
        <div className="stageLayer__shade" aria-hidden="true" />
        <StoryCopy state={state} step={selected ? step : undefined} decorative />
      </div>
    })}
  </div>
}
