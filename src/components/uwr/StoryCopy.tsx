import type { StoryStateData, StoryTriggerData } from '@/lib/uwr-story'

export function StoryCopy({ state, step, decorative }: { state: StoryStateData; step?: StoryTriggerData; decorative?: boolean }) {
  return <div className="storyCopy" aria-hidden={decorative}>
    <p className="kicker kicker--cyan">{state.eyebrow}</p>
    <h2>{state.title}</h2>
    {state.paragraphs.map(text => <p key={text}>{text}</p>)}
    {step?.label && <div className="storyCopy__detail" key={step.id}>
      <h3>{step.label}</h3><p>{step.text}</p>
    </div>}
  </div>
}
