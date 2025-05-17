import { cdk } from 'projen';
const project = new cdk.JsiiProject({
  author: 'Juho Saarinen',
  authorAddress: 'juho.saarinen@gmail.com',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.8.0',
  name: 'projen-biome',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/juho.saarinen/projen-biome.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();