import { compileJsiiForTest } from 'jsii'
import { fs, vol } from 'memfs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTypes } from '../src/schema'

// from https://vitest.dev/guide/mocking.html#example-3
// tell vitest to use fs mock from __mocks__ folder
// this can be done in a setup file if fs should always be mocked
vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  // reset the state of in-memory fs
  vol.reset()
})

describe('JSON to Types converter', () => {
  it('creates JSII compliant types', async () => {
    const testFile = '/types.ts'

    await createTypes(testFile)
    const types = fs.readFileSync(testFile, 'utf8').toString()

    expect(compileJsiiForTest(types)).toBeDefined()
  })
})
