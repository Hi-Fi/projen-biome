import { Component, JsonFile, ProjenrcFile } from 'projen'
import { Eslint, type NodeProject, Prettier } from 'projen/lib/javascript'
import { TypeScriptProject } from 'projen/lib/typescript'
import { IConfiguration } from './biome-configuration'
import { BiomeOptions, createBiomeConfiguration } from './configuration'
export * from './biome-configuration'
export { BiomeOptions } from './configuration'

export class Biome extends Component {
  public static of(project: NodeProject): Biome | undefined {
    const isBiome = (c: Component): c is Biome => c instanceof Biome
    return project.components.find(isBiome)
  }

  private readonly configFile: string
  private readonly optionsWithDefaults: BiomeOptions
  private readonly biomeConfiguration: IConfiguration
  private readonly projenrcFile?: string

  constructor(project: NodeProject, options: BiomeOptions = {}) {
    super(project)
    this.configFile = 'biome.jsonc'
    this.projenrcFile = this.project.components.find(
      (component) => component instanceof ProjenrcFile,
    )?.filePath
    this.optionsWithDefaults = {
      mergeArraysInConfiguration: (options as Object).hasOwnProperty(
        'mergeArraysInConfiguration',
      )
        ? options.mergeArraysInConfiguration
        : true,
      formatter: options.formatter ?? false,
      linter: options.linter ?? true,
      organizeImports: options.organizeImports ?? false,
      version: options.version ?? '^1',
      overrides: options.overrides,
    }

    project.addDevDeps(`@biomejs/biome@${this.optionsWithDefaults.version}`)

    this.biomeConfiguration = createBiomeConfiguration(this.optionsWithDefaults)

    new JsonFile(this, this.configFile, {
      obj: this.biomeConfiguration,
      committed: true,
      allowComments: true,
      marker: true,
    })

    const localTask = this.createLocalBiomeTask()
    project.testTask.spawn(localTask)
  }

  public override preSynthesize(): void {
    super.preSynthesize()

    for (const component of this.project.components) {
      if (
        component instanceof Eslint &&
        this.biomeConfiguration.linter?.enabled
      ) {
        throw new Error('Biome linter should not be used together with Eslint')
      }
      if (
        component instanceof Prettier &&
        (this.biomeConfiguration.formatter?.enabled ||
          this.biomeConfiguration.organizeImports?.enabled)
      ) {
        throw new Error(
          'Biome formatter should not be used together with Prettier',
        )
      }
    }
  }

  private createLocalBiomeTask() {
    const targetDirs: string[] = []
    this.projenrcFile && targetDirs.push(this.projenrcFile)

    if (this.project instanceof TypeScriptProject) {
      targetDirs.push(this.project.srcdir)
      targetDirs.push(this.project.testdir)
    }

    return this.project.addTask('biome', {
      description: 'Runs Biome against the codebase',
      steps: [
        {
          exec: `biome check --write ${targetDirs.join(' ')}`,
        },
      ],
    })
  }
}
