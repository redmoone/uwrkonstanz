'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { StoryHotspot } from '@/lib/uwr-stage'

type Props = {
  hotspot: StoryHotspot | null
  onClose: () => void
}

export function HotspotDialog({ hotspot, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const backdropPointer = useRef(false)
  const titleId = useId()
  const descriptionId = useId()
  const isOpen = mounted && hotspot !== null

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!isOpen || !dialog) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const body = document.body
    const root = document.documentElement
    const previousOverflow = body.style.overflow
    const previousRootOverflow = root.style.overflow
    const previousPadding = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - root.clientWidth

    body.style.overflow = 'hidden'
    root.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${parseFloat(window.getComputedStyle(body).paddingRight) + scrollbarWidth}px`
    }
    dialog.showModal()
    closeButtonRef.current?.focus({ preventScroll: true })

    return () => {
      if (dialog.open) dialog.close()
      body.style.overflow = previousOverflow
      root.style.overflow = previousRootOverflow
      body.style.paddingRight = previousPadding
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [isOpen])

  if (!mounted || !hotspot) return null

  return createPortal(
    <dialog ref={dialogRef} className="hotspot-dialog" aria-modal="true"
      aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={event => { event.preventDefault(); onClose() }}
      onPointerDown={event => { backdropPointer.current = event.target === event.currentTarget }}
      onClick={event => {
        if (backdropPointer.current && event.target === event.currentTarget) onClose()
        backdropPointer.current = false
      }}>
      <div className="hotspot-dialog__panel">
        <div className="hotspot-dialog__header">
          <h2 id={titleId} className="hotspot-dialog__title">{hotspot.label}</h2>
          <button ref={closeButtonRef} type="button" className="hotspot-dialog__close"
            aria-label="Erklärung schließen" onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p id={descriptionId} className="hotspot-dialog__description">{hotspot.description}</p>
      </div>
    </dialog>,
    document.body,
  )
}
