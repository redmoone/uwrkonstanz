import { CalendarDays, MapPin } from 'lucide-react'
import { Header } from '@/components/Header'
import { getHomeData } from '@/lib/home-data'
import { getTrainingCalendarDate } from '@/lib/training-dates'

export const dynamic = 'force-dynamic'

const displayDate = (value: unknown) => {
  const date = getTrainingCalendarDate(value)
  return date ? new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`)) : ''
}

export default async function TrainingPage() {
  const { trainings, trainingBreaks, nextTraining } = await getHomeData()
  const today = getTrainingCalendarDate(new Date().toISOString())!
  const futureTrainings = trainings.filter(training => {
    const end = getTrainingCalendarDate(training.oneOffDate || training.validUntil)
    return !end || end >= today
  })
  const plannedBreaks = trainingBreaks.filter(pause => {
    const end = getTrainingCalendarDate(pause.endDate || pause.startDate)
    return end && end >= today
  })

  return (
    <main className="subpage">
      <div className="page-shell">
        <Header />
        <header className="subpage-header"><p className="kicker">TRAINING</p><h1>REIN INS WASSER</h1></header>
        <section className="subpage-content">
          <h2>NÄCHSTES TRAINING</h2>
          {nextTraining ? (
            <>
              <div className="training-info"><CalendarDays /><div><strong><time dateTime={nextTraining.date}>{nextTraining.dateLabel}</time></strong><span>{nextTraining.training.startTime}–{nextTraining.training.endTime} Uhr</span></div></div>
              <div className="training-info"><MapPin /><div><strong>{nextTraining.training.location}</strong><span>{nextTraining.training.address}</span></div></div>
            </>
          ) : <p>Aktuell ist kein nächster Trainingstermin geplant. Melde dich bei uns, bevor du vorbeikommst.</p>}

          <h2>TRAININGSPLAN</h2>
          <p>Hier findest du unsere Trainingsserien und zusätzliche Einzeltermine. Die unten aufgeführten Ausfälle werden bei der Anzeige des nächsten Trainings berücksichtigt.</p>
          {futureTrainings.length ? futureTrainings.map(training => (
            <article key={training.id}>
              <h3>{training.label}</h3>
              <div className="training-info"><CalendarDays /><div><strong>{training.oneOffDate ? displayDate(training.oneOffDate) : `Jeden ${training.weekday}`}</strong><span>{training.startTime}–{training.endTime} Uhr</span></div></div>
              <p><strong>{training.location}</strong>{training.address && <><br />{training.address}</>}</p>
              {!training.oneOffDate && (training.validFrom || training.validUntil) && <p>{training.validFrom ? `Ab ${displayDate(training.validFrom)}` : 'Fortlaufend'}{training.validUntil && ` bis einschließlich ${displayDate(training.validUntil)}`}</p>}
            </article>
          )) : <p>Derzeit sind keine Trainingszeiten eingetragen.</p>}

          {plannedBreaks.length > 0 && <>
            <h2>AUSFÄLLE & FERIENPAUSEN</h2>
            {plannedBreaks.map((pause, index) => {
              const ids = pause.trainings.map(training => String(typeof training === 'object' ? training.id : training))
              const affected = trainings.filter(training => ids.includes(String(training.id)))
              const from = displayDate(pause.startDate)
              const until = displayDate(pause.endDate || pause.startDate)
              return <article key={`${pause.startDate}-${index}`}><h3>{pause.reason || 'Training fällt aus'}</h3><p>{from === until ? from : `${from} bis einschließlich ${until}`}<br />{affected.map(training => `${training.label} (${training.weekday}, ${training.location})`).join(' · ')}</p></article>
            })}
          </>}
        </section>
      </div>
    </main>
  )
}
