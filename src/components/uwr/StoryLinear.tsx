import { StoryCopy } from './StoryCopy'
import { uwrCopy } from '@/lib/uwr-explainer'
import { uwrStageSteps, type StoryStateData, type StoryStateId } from '@/lib/uwr-stage'

// One photograph above, followed by compact source copy. No duplicated scenes.
export function StoryLinear({ enabled, activeStep, onSelect }: {
  enabled: boolean; activeStep: StoryStateData; onSelect: (id: StoryStateId) => void
}) {
  const index = uwrStageSteps.findIndex(step => step.id === activeStep.id)
  return <div className="storyLinear" aria-hidden={!enabled} inert={!enabled}>
    <div className="storyLinear__controls">
      <p className="storyLinear__hint">Tippe auf ein Thema oder eine Markierung im Bild.</p>
      <div className="storyLinear__topics" role="group" aria-label="Thema auswählen">
        {uwrStageSteps.map(step => <button key={step.id} type="button"
          aria-pressed={step.id === activeStep.id} aria-controls="uwr-selected-topic"
          onClick={() => onSelect(step.id)}>{step.eyebrow.split(' / ').slice(1).join(' / ')}</button>)}
      </div>
      <div className="storyLinear__navigation">
        <button type="button" disabled={index === 0} onClick={() => onSelect(uwrStageSteps[index - 1].id)}>← Zurück</button>
        <span>{index + 1} / {uwrStageSteps.length}</span>
        <button type="button" disabled={index === uwrStageSteps.length - 1} onClick={() => onSelect(uwrStageSteps[index + 1].id)}>Weiter →</button>
      </div>
    </div>
    <article id="uwr-selected-topic" className="storyLinear__state" aria-live="polite" aria-atomic="true">
      <StoryCopy state={{ ...activeStep, paragraphs: uwrCopy[activeStep.id] }} />
    </article>
  </div>
}
