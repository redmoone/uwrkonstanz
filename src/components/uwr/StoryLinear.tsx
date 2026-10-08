import { StoryCopy } from './StoryCopy'
import { uwrCopy } from '@/lib/uwr-explainer'
import { uwrStageSteps } from '@/lib/uwr-stage'

// One photograph above, followed by compact source copy. No duplicated scenes.
export function StoryLinear({ enabled }: { enabled: boolean }) {
  return <div className="storyLinear" aria-hidden={!enabled} inert={!enabled}>
    {uwrStageSteps.map(step => <article key={step.id} className="storyLinear__state">
      <StoryCopy state={{ ...step, paragraphs: uwrCopy[step.id] }} />
    </article>)}
  </div>
}
