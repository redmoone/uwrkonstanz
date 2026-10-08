import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/lib/uwr-scroll.ts', import.meta.url), 'utf8')
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText
const { canScrollVertically } = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`)

const copy = scrollTop => ({ scrollTop, scrollHeight: 320, clientHeight: 120 })

test('swipes over short or equally tall copy hand off to chapter navigation in either direction', () => {
  for (const scrollHeight of [80, 120, 120.5]) {
    const metrics = { scrollTop: 0, scrollHeight, clientHeight: 120 }
    assert.equal(canScrollVertically(metrics, 40), false)
    assert.equal(canScrollVertically(metrics, -40), false)
  }
})

test('long copy keeps the gesture native while it has content available in that direction', () => {
  assert.equal(canScrollVertically(copy(90), 40), true)
  assert.equal(canScrollVertically(copy(90), -40), true)
  assert.equal(canScrollVertically(copy(0), 40), true)
  assert.equal(canScrollVertically(copy(200), -40), true)
})

test('a fresh swipe hands off only when it points beyond the beginning or end of the copy', () => {
  assert.equal(canScrollVertically(copy(0), -40), false)
  assert.equal(canScrollVertically(copy(200), 40), false)
  assert.equal(canScrollVertically(copy(0), 40), true)
  assert.equal(canScrollVertically(copy(200), -40), true)
})

test('Safari elastic overscroll and fractional 1px boundaries do not trap a chapter swipe', () => {
  assert.equal(canScrollVertically(copy(-18), -40), false)
  assert.equal(canScrollVertically(copy(-18), 40), true)
  assert.equal(canScrollVertically(copy(218), 40), false)
  assert.equal(canScrollVertically(copy(218), -40), true)
  assert.equal(canScrollVertically(copy(.75), -40), false)
  assert.equal(canScrollVertically(copy(1.25), -40), true)
  assert.equal(canScrollVertically(copy(199.25), 40), false)
  assert.equal(canScrollVertically(copy(198.75), 40), true)
})

test('a gesture with no vertical movement does not claim the copy scroll area', () => {
  assert.equal(canScrollVertically(copy(90), 0), false)
  assert.equal(canScrollVertically(copy(0), 0), false)
  assert.equal(canScrollVertically(copy(200), 0), false)
})
