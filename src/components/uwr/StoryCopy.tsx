import type { StoryStateData } from '@/lib/uwr-stage'

export function StoryCopy({ state, decorative }: { state: StoryStateData; decorative?: boolean }) {
  return <div className="storyCopy" aria-hidden={decorative}>
    <p className="kicker kicker--cyan">{state.eyebrow}</p>
    <h2>{state.title}</h2>
    {state.paragraphs.map(text => <p key={text}>{text}</p>)}
  </div>
}
