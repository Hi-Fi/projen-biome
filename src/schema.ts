import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { compileFromFile } from 'json-schema-to-typescript'

export const createTypes = async (
  typesFile = join(__dirname, '..', 'src', 'biome-configuration.ts'),
) => {
  const types = (
    await compileFromFile(
      join(
        __dirname,
        '..',
        'node_modules',
        '@biomejs',
        'biome',
        'configuration_schema.json',
      ),
      {
        customName: (_schema, keyName): string | undefined => {
          const name = keyName ?? _schema.title ?? _schema.$id
          if (!name) {
            return undefined
          }
          return `I${name}`
        },
      },
    )
  )
    // JSII doesn't like optional values that can also be null
    .replace(/(\?:.*) \| null;/g, '$1;')
    // Removing or undefined, as that should be optional in TS sense like it is marked also
    .replace(/ \| undefined/g, '')
    // JSII wants interfaces with PascalCase
    .replace(/IA11Y/g, 'IA11y')
    // Change type to be OK for JSII
    .replace('boolean | [number, ...number[]]', 'boolean | number[]')
    .replace('$schema', '//$schema')
  // JSII doesn't like optional values that can also be null
  writeFileSync(typesFile, types)
}
