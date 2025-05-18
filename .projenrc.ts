import { Vitest } from '@nikovirtala/projen-vitest'
import { cdk } from 'projen'
import { GithubCredentials } from 'projen/lib/github'
import { NodePackageManager } from 'projen/lib/javascript'
import { Biome } from './src'
import { createTypes } from './src/schema'

const project = new cdk.JsiiProject({
  author: 'Juho Saarinen',
  authorAddress: 'juho.saarinen@gmail.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.8.0',
  license: 'MIT',
  name: 'projen-biome',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/Hi-Fi/projen-biome.git',
  packageManager: NodePackageManager.NPM,
  renovatebot: true,
  depsUpgradeOptions: {
    workflow: false,
  },
  devDeps: ['@nikovirtala/projen-vitest', 'json-schema-to-typescript', 'memfs'],
  peerDeps: ['projen', 'constructs'],
  jest: false,
  // Use biome (this project) instead of eslint and prettier
  eslint: false,
  prettier: false,
  projenCredentials: GithubCredentials.fromPersonalAccessToken({
    secret: 'GITHUB_TOKEN',
  }),

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
})

new Vitest(project)
new Biome(project, {
  formatter: true,
  organizeImports: true,
  overrides: {
    files: {
      ignore: ['src/biome-configuration.ts', '__mocks__'],
    },
  },
})

project.npmignore?.addPatterns('__mocks__')

project.postSynthesize = async () => {
  await createTypes()
}

project.vscode?.extensions.addRecommendations('biomejs.biome')

project.synth()
