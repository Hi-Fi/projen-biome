> [!IMPORTANT]  
> As Projen has had support for Biome since version [0.92.11](https://github.com/projen/projen/releases/tag/v0.92.11), this separate component has became obsolete and repo has been archived.
>
> This is left to be visible to be an example of how to create a projen component.

# Biome component for Projen NodeJS projects

- [Biome](https://biomejs.dev/) 
- [Projen](https://projen.io)

## Example usage

- in Projen configuration file (usually `.projenrc.ts` or `.projenrc.js`) import `Biome` component and create new instance of it:

```ts
import { cdk } from 'projen'
import { Biome } from "projen-biome";

const project = new cdk.JsiiProject({
    defaultReleaseBranch: "main",
    devDeps: ["projen-biome"],
    eslint: false,
    prettier: false,
    name: "biome-example",
    projenrcTs: true,
});

new Biome(project);

project.synth();
```

- Run only linting with `npm run biome`
- Run full testing (including tests and linting/formatting) with `npm run test`
