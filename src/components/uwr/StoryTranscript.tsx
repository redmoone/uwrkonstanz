import { StoryCopy } from './StoryCopy'
import { uwrCopy } from '@/lib/uwr-explainer'
import { uwrStageSteps } from '@/lib/uwr-stage'

// Full source copy is accessible without timing or scrolling.
export function StoryTranscript({ enabled }: { enabled: boolean }) {
  return <div className="sr-only" aria-hidden={!enabled} inert={!enabled}>
    {uwrStageSteps.map(step => <StoryCopy key={step.id} state={{ ...step, paragraphs: uwrCopy[step.id] }} />)}
  </div>
}
