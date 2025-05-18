import { describe, expect, it } from 'vitest'
import { createBiomeConfiguration } from '../src/configuration'

describe('Configuration', () => {
  describe('should match snapshot', () => {
    describe('without overrides', () => {
      it('without options', () => {
        expect(createBiomeConfiguration({})).toMatchSnapshot()
      })
      it('with linter', () => {
        expect(createBiomeConfiguration({ linter: true })).toMatchSnapshot()
      })

      it('with formatter', () => {
        expect(createBiomeConfiguration({ formatter: true })).toMatchSnapshot()
      })

      it('with import organizer', () => {
        expect(
          createBiomeConfiguration({ organizeImports: true }),
        ).toMatchSnapshot()
      })

      it('with all features', () => {
        expect(
          createBiomeConfiguration({
            linter: true,
            formatter: true,
            organizeImports: true,
          }),
        ).toMatchSnapshot()
      })
    })
  })

  describe('should', () => {
    describe('merge arrays', () => {
      it('when mergeArraysInConfiguration is true', () => {
        const linterConfig = createBiomeConfiguration({ linter: true })

        expect(linterConfig.linter?.ignore?.[0]).toBeDefined()

        const mergedConfig = createBiomeConfiguration({
          linter: true,
          overrides: {
            linter: {
              ignore: ['**/bin'],
            },
          },
        })

        expect(mergedConfig.linter?.ignore?.length).toBe(
          linterConfig.linter!.ignore!.length + 1,
        )
      })

      it('without duplicate values', () => {
        const linterConfig = createBiomeConfiguration({ linter: true })

        expect(linterConfig.linter?.ignore?.[0]).toBeDefined()
        const mergedConfig = createBiomeConfiguration({
          linter: true,
          overrides: {
            linter: {
              ignore: [linterConfig.linter!.ignore![0]],
            },
          },
        })

        expect(
          mergedConfig.linter?.ignore?.filter(
            (ignore) => ignore === linterConfig.linter?.ignore?.[0],
          ).length,
        ).toBe(1)
      })
    })

    describe('replace whole array', () => {
      it('when mergeArraysInConfiguration is false', () => {
        const linterConfig = createBiomeConfiguration({ linter: true })
        if (!linterConfig.linter?.ignore?.[0]) {
        }

        expect(linterConfig.linter?.ignore?.[0]).toBeDefined()
        const mergedConfig = createBiomeConfiguration({
          linter: true,
          mergeArraysInConfiguration: false,
          overrides: {
            linter: {
              ignore: [linterConfig.linter!.ignore![0]],
            },
          },
        })

        expect(
          mergedConfig.linter?.ignore?.filter(
            (ignore) => ignore === linterConfig.linter?.ignore?.[0],
          ).length,
        ).toBe(1)
      })
    })

    it('make deep merge', () => {
      const mergedConfig = createBiomeConfiguration({
        linter: true,
        overrides: {
          linter: {
            rules: {
              a11y: {
                noBlankTarget: 'error',
              },
            },
          },
        },
      })

      expect(mergedConfig.linter?.rules).toBeDefined()
      expect(Object.keys(mergedConfig.linter!.rules!).length).toBeGreaterThan(1)
    })
  })
})
