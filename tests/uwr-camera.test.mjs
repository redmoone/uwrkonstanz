import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

function moduleURL(name, dependencies = {}) {
  const source = readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), 'utf8')
  let output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  for (const [dependency, url] of Object.entries(dependencies)) {
    output = output.replace(new RegExp(`(['"])\\./${dependency}\\1`, 'g'), () => JSON.stringify(url))
  }
  return `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
}
const explainer = moduleURL('uwr-explainer')
const { uwrStageSteps } = await import(moduleURL('uwr-stage', { 'uwr-explainer': explainer }))
const { uwrHotspots } = await import(moduleURL('uwr-hotspots', {
  'uwr-explainer': explainer, 'uwr-outlines': moduleURL('uwr-outlines'),
}))
const { fitHotspotCamera } = await import(moduleURL('uwr-camera'))
const image = { width: 1536, height: 1024 }
const tolerance = 1e-7

// Model the actual phone SVG: 150% wide, centered and capped at 44svh.
// A desktop browser's 15px scrollbar reduces its content width.
function visiblePhoto(width, height) {
  const contentWidth = width - 15
  const svgWidth = contentWidth * 1.5
  const svgHeight = Math.min(svgWidth * image.height / image.width, height * .44)
  const baseScale = Math.min(svgWidth / image.width, svgHeight / image.height)
  const imageLeft = -contentWidth / 4 + (svgWidth - image.width * baseScale) / 2
  return {
    baseScale,
    bounds: {
      left: Math.max(0, -imageLeft / baseScale),
      right: Math.min(image.width, (contentWidth - imageLeft) / baseScale),
      top: 0, bottom: image.height,
    },
  }
}

function assertAllTargetsFit(camera, frame, context) {
  const { bounds, baseScale } = frame
  for (const point of uwrHotspots) {
    const x = point.x * camera.zoom + camera.x
    const y = point.y * camera.zoom + camera.y
    // The compensated buttons stay 44 CSS pixels wide at every zoom.
    const clearances = [
      (x - bounds.left) * baseScale - 22,
      (bounds.right - x) * baseScale - 22,
      (y - bounds.top) * baseScale - 22,
      (bounds.bottom - y) * baseScale - 22,
    ]
    assert.ok(clearances.every(value => value >= 2 - tolerance),
      `${context}: ${point.id} clips its 44px target: ${clearances.join(', ')}`)
  }
  assert.ok(camera.x <= bounds.left + tolerance && camera.x + image.width * camera.zoom >= bounds.right - tolerance,
    `${context}: horizontal blank photo edge`)
  assert.ok(camera.y <= bounds.top + tolerance && camera.y + image.height * camera.zoom >= bounds.bottom - tolerance,
    `${context}: vertical blank photo edge`)
}

for (const [width, height] of [[320, 568], [390, 844]]) {
  test(`keeps all eight 44px targets inside the ${width}x${height} mobile crop for every chapter`, () => {
    const frame = visiblePhoto(width, height)
    assert.equal(uwrHotspots.length, 8)
    for (const step of uwrStageSteps) {
      const fitted = fitHotspotCamera(step.mobileCamera, uwrHotspots, frame.bounds, frame.baseScale, image)
      assertAllTargetsFit(fitted, frame, `${width}x${height}/${step.id}`)
      // Regression for the former 1.9x chapter zoom, which hid other points.
      const excessive = fitHotspotCamera({ ...step.mobileCamera, zoom: 1.9 }, uwrHotspots, frame.bounds, frame.baseScale, image)
      assertAllTargetsFit(excessive, frame, `${width}x${height}/${step.id}/1.9x request`)
    }
  })
}

test('fits all targets into the photo itself when a short landscape SVG is letterboxed', () => {
  const frame = visiblePhoto(640, 500)
  assert.deepEqual(frame.bounds, { left: 0, right: image.width, top: 0, bottom: image.height })
  for (const step of uwrStageSteps) {
    assertAllTargetsFit(fitHotspotCamera(step.mobileCamera, uwrHotspots, frame.bounds, frame.baseScale, image),
      frame, `640x500/${step.id}`)
    assertAllTargetsFit(fitHotspotCamera({ ...step.mobileCamera, zoom: 1.9 }, uwrHotspots, frame.bounds, frame.baseScale, image),
      frame, `640x500/${step.id}/1.9x request`)
  }
})

test('keeps every target visible while interpolating from the resting photo and between chapters', () => {
  for (const [width, height] of [[320, 568], [390, 844], [640, 500]]) {
    const frame = visiblePhoto(width, height)
    const cameras = [{ x: 0, y: 0, zoom: 1 }, ...uwrStageSteps.map(step =>
      fitHotspotCamera(step.mobileCamera, uwrHotspots, frame.bounds, frame.baseScale, image))]
    for (let index = 1; index < cameras.length; index++) {
      const origin = cameras[index - 1], destination = cameras[index]
      for (const progress of [0, .5, 1]) {
        const next = Object.fromEntries(['x', 'y', 'zoom'].map(key =>
          [key, origin[key] + (destination[key] - origin[key]) * progress]))
        assertAllTargetsFit(next, frame, `${width}x${height}/transition ${index}/${progress}`)
      }
    }
  }
})

test('preserves the requested camera when there are no hotspots', () => {
  const target = { x: -100, y: -80, zoom: 1.4 }
  const frame = visiblePhoto(320, 568)
  assert.equal(fitHotspotCamera(target, [], frame.bounds, frame.baseScale, image), target)
})