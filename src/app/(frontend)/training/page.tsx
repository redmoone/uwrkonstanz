import type { Metadata } from 'next'
import { ArrowDown, CalendarDays, CalendarOff, Clock3, MapPin } from 'lucide-react'
import { Header } from '@/components/Header'
import { Logo } from '@/components/Logo'
import { TrainingLocationMap } from '@/components/TrainingLocationMap'
import { getHomeData } from '@/lib/home-data'
import { getTrainingCalendarDate } from '@/lib/training-dates'
import { getUpcomingTrainings, groupTrainingsByLocation } from '@/lib/training-locations'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Trainingsorte & Termine – UWR Konstanz',
  description: 'Unsere Trainingsorte, nächsten Termine und Ferienpausen: Unterwasserrugby im Schwaketenbad und weitere Trainings am Bodensee.',
}

const dateFormat = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
const weekdayFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'long', timeZone: 'UTC' })
const displayDate = (value: unknown) => {
  const date = getTrainingCalendarDate(value)
  return date ? dateFormat.format(new Date(`${date}T12:00:00Z`)) : ''
}
const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
const relationshipID = (value: string | number | { id: string | number }) => String(typeof value === 'object' ? value.id : value)

export default async function TrainingPage() {
  const { trainings, trainingBreaks, nextTraining } = await getHomeData()
  const now = new Date()
  const today = getTrainingCalendarDate(now.toISOString())!
  const locations = groupTrainingsByLocation(trainings, now, trainingBreaks)

  return <main className="subpage training-page">
    <div className="page-shell">
      <Header />
      <header className="subpage-header training-page__header">
        <p className="kicker">TRAININGSORTE & TERMINE</p>
        <h1>REIN INS<br />WASSER.</h1>
        <p className="training-page__intro">Wo wir trainieren. Wann wir im Wasser sind. Und wann wir Pause machen.</p>
      </header>

      <section className="training-next" aria-labelledby="training-next-title">
        <div className="training-next__label"><CalendarDays size={26} aria-hidden="true" /><h2 id="training-next-title">NÄCHSTES TRAINING</h2></div>
        {nextTraining ? <>
          <div className="training-next__date"><time dateTime={nextTraining.date}>{nextTraining.dateLabel}</time><span>{nextTraining.training.startTime}–{nextTraining.training.endTime} Uhr</span></div>
          <div className="training-next__place"><MapPin size={19} aria-hidden="true" /><span>{nextTraining.training.location}</span></div>
        </> : <p>Aktuell ist kein weiterer Trainingstermin geplant.</p>}
        {locations.length > 0 && <a href="#trainingsorte" className="training-next__jump" aria-label="Zu den Trainingsorten"><ArrowDown size={22} aria-hidden="true" /></a>}
      </section>

      <div id="trainingsorte" className="training-locations">
        {locations.length > 1 && <nav className="training-locations__nav" aria-label="Trainingsorte">{locations.map((venue, index) => <a href={`#trainingsort-${index + 1}`} key={venue.key}>{venue.location} <ArrowDown size={15} aria-hidden="true" /></a>)}</nav>}
        {locations.map((venue, index) => {
          const upcoming = getUpcomingTrainings(venue.trainings, now, venue.breaks, 6)
          const currentBreak = venue.breaks.some(pause => {
            const start = getTrainingCalendarDate(pause.startDate)
            const end = getTrainingCalendarDate(pause.endDate || pause.startDate)
            return start && end && start <= today && end >= today
          })
          return <section className="training-venue" id={`trainingsort-${index + 1}`} key={venue.key} aria-labelledby={`trainingsort-title-${index + 1}`}>
            <header className="training-venue__header">
              <div><p className="kicker">{String(index + 1).padStart(2, '0')} / TRAININGSORT</p><h2 id={`trainingsort-title-${index + 1}`}>{venue.location}</h2></div>
              {venue.address && <p className="training-venue__address"><MapPin size={18} aria-hidden="true" />{venue.address}</p>}
            </header>

            <div className="training-venue__overview">
              <div className="training-venue__plan">
                <h3><Clock3 size={18} aria-hidden="true" />TRAININGSZEITEN</h3>
                <ul className="training-series">
                  {venue.trainings.map(training => <li key={training.id}>
                    <div className="training-series__heading"><strong>{training.oneOffDate ? displayDate(training.oneOffDate) : capitalize(training.weekday)}</strong><span>{training.oneOffDate ? 'Einzeltermin' : 'Wöchentlich'}</span></div>
                    <p className="training-series__time">{training.startTime}–{training.endTime}<small>Uhr</small></p>
                    <p className="training-series__name">{training.label}</p>
                    {!training.oneOffDate && (training.validFrom || training.validUntil) && <p className="training-series__range">{training.validFrom ? `Ab ${displayDate(training.validFrom)}` : 'Fortlaufend'}{training.validUntil && ` bis ${displayDate(training.validUntil)}`}</p>}
                  </li>)}
                </ul>
                {currentBreak && <div className="training-pause-note"><CalendarOff size={20} aria-hidden="true" /><p>Aktuell gibt es hier eine Trainingspause. Die nächsten Termine unten berücksichtigen alle Ausfälle.</p></div>}
              </div>
              <TrainingLocationMap location={venue.location} address={venue.address} mapUrl={venue.mapUrl} />
            </div>

            <section className="training-dates" aria-labelledby={`training-dates-title-${index + 1}`}>
              <div className="training-dates__heading"><h3 id={`training-dates-title-${index + 1}`}>NÄCHSTE TERMINE</h3><p>Ausfälle und Ferienpausen sind bereits berücksichtigt.</p></div>
              {upcoming.length ? <ol className="training-dates__list">{upcoming.map((session, sessionIndex) => <li key={`${session.training.id}-${session.date}`}>
                <time dateTime={session.date}><span>{weekdayFormat.format(new Date(`${session.date}T12:00:00Z`))}</span><strong>{displayDate(session.date)}</strong></time>
                <div><strong>{session.training.startTime}–{session.training.endTime} Uhr</strong><span>{session.training.label}</span></div>
                <span className="training-dates__status">{sessionIndex === 0 ? 'Nächster Termin' : 'Findet statt'}</span>
              </li>)}</ol> : <p className="training-empty">Aktuell ist hier kein weiterer Trainingstermin geplant.</p>}
            </section>

            {venue.breaks.length > 0 && <details className="training-breaks" open={currentBreak}>
              <summary><span><CalendarOff size={19} aria-hidden="true" />PAUSEN & AUSFÄLLE</span><span>{venue.breaks.length} {venue.breaks.length === 1 ? 'Zeitraum' : 'Zeiträume'} <ArrowDown size={17} aria-hidden="true" /></span></summary>
              <ul>{venue.breaks.map((pause, pauseIndex) => {
                const from = displayDate(pause.startDate)
                const through = displayDate(pause.endDate || pause.startDate)
                const affectedIDs = pause.trainings.map(relationshipID)
                const affected = venue.trainings.filter(training => affectedIDs.includes(String(training.id)))
                const start = getTrainingCalendarDate(pause.startDate)!
                const end = getTrainingCalendarDate(pause.endDate || pause.startDate)!
                return <li key={`${pause.startDate}-${pauseIndex}`}>
                  <p className="training-breaks__range">{from === through ? from : `${from}–${through}`}{start <= today && end >= today && <span>Aktuelle Pause</span>}</p>
                  <h4>{pause.reason || 'Training fällt aus'}</h4>
                  <p>{affected.map(training => training.oneOffDate ? `${training.label} (${displayDate(training.oneOffDate)})` : `${capitalize(training.weekday)} ${training.startTime} Uhr`).join(' · ')}</p>
                </li>
              })}</ul>
            </details>}
          </section>
        })}
        {locations.length === 0 && <p className="training-empty">Derzeit sind keine Trainingsorte mit kommenden Trainingszeiten eingetragen.</p>}
      </div>
    </div>
    <footer className="footer"><div className="page-shell footer__inner"><Logo /><span>UWR Konstanz · Unterwasserrugby am Bodensee</span></div></footer>
  </main>
}
