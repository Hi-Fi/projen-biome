import { Eslint, Prettier } from 'projen/lib/javascript'
import {
  TypeScriptProject,
  type TypeScriptProjectOptions,
} from 'projen/lib/typescript'
import { synthSnapshot } from 'projen/lib/util/synth'
import { describe, expect, it } from 'vitest'
import { Biome } from '../src'
import type { IConfiguration } from '../src/biome-configuration'

const getTestProject = (
  projenOptions: Partial<TypeScriptProjectOptions>,
): TypeScriptProject => {
  return new TypeScriptProject({
    name: 'test-project',
    defaultReleaseBranch: 'main',
    sampleCode: false,
    githubOptions: {
      mergify: false,
    },
    ...projenOptions,
  })
}

describe('biome', () => {
  describe('throws error when', () => {
    describe('eslint is enabled', () => {
      it('directly on project configuration', () => {
        const project = getTestProject({ eslint: true })

        new Biome(project)

        expect(() => synthSnapshot(project)).toThrow(
          'Biome linter should not be used together with Eslint',
        )
      })

      it('after biome', () => {
        const project = getTestProject({ eslint: false })

        new Biome(project)
        new Eslint(project, {
          dirs: ['src'],
        })
        expect(() => synthSnapshot(project)).toThrow(
          'Biome linter should not be used together with Eslint',
        )
      })
    })

    describe('prettier is enabled', () => {
      describe('directly on project configuration', () => {
        it('with biome formatter', () => {
          const project = getTestProject({ prettier: true, eslint: false })

          new Biome(project, {
            formatter: true,
          })

          expect(() => synthSnapshot(project)).toThrow(
            'Biome formatter should not be used together with Prettier',
          )
        })

        it('with biome import organizer', () => {
          const project = getTestProject({ prettier: true, eslint: false })

          new Biome(project, {
            organizeImports: true,
          })

          expect(() => synthSnapshot(project)).toThrow(
            'Biome formatter should not be used together with Prettier',
          )
        })
      })

      describe('after biome', () => {
        it('with biome formatter', () => {
          const project = getTestProject({ prettier: false, eslint: false })

          new Biome(project, {
            formatter: true,
          })
          new Prettier(project, {})

          expect(() => synthSnapshot(project)).toThrow(
            'Biome formatter should not be used together with Prettier',
          )
        })

        it('with biome import organizer', () => {
          const project = getTestProject({ prettier: false, eslint: false })

          new Biome(project, {
            organizeImports: true,
          })

          new Prettier(project, {})

          expect(() => synthSnapshot(project)).toThrow(
            'Biome formatter should not be used together with Prettier',
          )
        })
      })
    })
  })

  describe('with default configuration', () => {
    describe('generates correct snapshot for', () => {
      const project = getTestProject({ eslint: false, prettier: false })
      new Biome(project)

      const snapshots = synthSnapshot(project)
      for (const file of Object.keys(snapshots)) {
        it(file, () => {
          expect(snapshots[file]).toMatchSnapshot()
        })
      }
    })
  })

  describe('with', () => {
    it('formatter enabled', () => {
      const project = getTestProject({ eslint: false, prettier: false })
      new Biome(project, {
        formatter: true,
      })

      const config: IConfiguration = synthSnapshot(project)['biome.jsonc']
      expect(config.formatter?.enabled).toBeTruthy()
    })

    it('organizer enabled', () => {
      const project = getTestProject({ eslint: false, prettier: false })
      new Biome(project, {
        organizeImports: true,
      })

      const config: IConfiguration = synthSnapshot(project)['biome.jsonc']
      expect(config.organizeImports?.enabled).toBeTruthy()
    })

    it('custom overrides', () => {
      const project = getTestProject({ eslint: false, prettier: false })
      new Biome(project, {
        formatter: true,
        overrides: {
          files: {
            ignore: ['ignored-file.txt'],
          },
        },
      })

      const config: IConfiguration = synthSnapshot(project)['biome.jsonc']
      expect(config.formatter?.enabled).toBeTruthy()
      expect(config.files?.ignore).toContain('ignored-file.txt')
    })
  })

  describe('of', () => {
    it('returns Biome instance when found', () => {
      const project = getTestProject({ eslint: false, prettier: false })
      const biome = new Biome(project)

      const found = Biome.of(project)
      expect(found).toBe(biome)
    })

    it('returns undefined when not found', () => {
      const project = getTestProject({ eslint: false, prettier: false })
      const found = Biome.of(project)
      expect(found).toBeUndefined()
    })
  })
})
