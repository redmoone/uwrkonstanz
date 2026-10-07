import { StoryCopy } from './StoryCopy'
import { uwrStoryStates, uwrStoryTriggers } from '@/lib/uwr-story'

// All copy remains available to assistive technology, independent of scrolling.
// No off-screen interactive controls or duplicate mobile reading order.
export function StoryTranscript({ enabled }: { enabled: boolean }) {
  return <div className="sr-only" aria-hidden={!enabled} inert={!enabled}>
    {uwrStoryStates.map(state => <div key={state.id}>
      <StoryCopy state={state} />
      {uwrStoryTriggers.filter(step => step.stateId === state.id && step.label).map(step =>
        <div key={step.id}><h3>{step.label}</h3><p>{step.text}</p></div>)}
    </div>)}
  </div>
}
