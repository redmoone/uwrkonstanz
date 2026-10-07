import { InteractiveImage } from './InteractiveImage'
import { StoryCopy } from './StoryCopy'
import { uwrStoryTriggers, type StoryStateData } from '@/lib/uwr-story'

type Props = { states: StoryStateData[]; enabled: boolean; hoveredId: string | null; onHoverChange: (id: string | null) => void }

export function StoryLinear({ states, enabled, hoveredId, onHoverChange }: Props) {
  return <div className="storyLinear" aria-hidden={!enabled} inert={!enabled}>
    {states.map(state => <article key={state.id} className="storyLinear__state">
      <InteractiveImage image={state.image} hotspots={state.hotspots} activeId={hoveredId}
        onHoverChange={onHoverChange} caption={state.image.alt} />
      <StoryCopy state={state} />
      {uwrStoryTriggers.filter(step => step.stateId === state.id && step.label).map(step =>
        <div key={step.id} className="storyLinear__detail"><h3>{step.label}</h3><p>{step.text}</p></div>)}
    </article>)}
  </div>
}
