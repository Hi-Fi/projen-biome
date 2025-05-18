import { IConfiguration } from './biome-configuration'

export interface BiomeOptions {
  /**
   * Version of Biome to use
   *
   * @default "^1"
   */
  readonly version?: string
  /**
   * Enable linting. Replaces Eslint.
   *
   * @default true
   */
  readonly linter?: boolean
  /**
   * Enable code formatter. Replaces mainly Prettier
   *
   * @default false
   */
  readonly formatter?: boolean
  /**
   * Enable import sorting/organizing. Replaces mainly Prettier
   *
   * @default false
   */
  readonly organizeImports?: boolean

  /**
   * Should arrays be merged or overwritten when creating Biome configuration
   *
   * By default arrays are merged and duplicate values are removed
   *
   * @default true
   */
  readonly mergeArraysInConfiguration?: boolean
  /**
   * Full Biome configuration. Note that this configuration dictates the final outcome is value is set.
   *
   * @example if linter is disabled on main level, it can be enabled on fullConfiguration.formatter.enabled.
   */
  readonly overrides?: IConfiguration
}

/**
 * Default configuration that's used when Eslint was enabled in Projen.
 *
 * Note that Eslint had some formatting options, but those are removed from here and available only within formatter.
 *
 * Generated using `biome migrate eslint`. Some common settings not included here which are in both (Prettier and Eslint) migration configuration
 */
const eslintConfiguration = (projenrcFile?: string): IConfiguration => {
  const include = projenrcFile ? [projenrcFile] : []

  return {
    linter: {
      enabled: true,
      rules: {
        recommended: false,
        complexity: {
          useLiteralKeys: 'error',
        },
        style: {
          useBlockStatements: 'error',
        },
      },
      ignore: [
        '**/*.js',
        '**/*.d.ts',
        '**/node_modules/',
        '**/*.generated.ts',
        '**/coverage',
      ],
    },
    overrides: [
      {
        include,
        linter: {
          rules: {},
        },
      },
    ],
  }
}

/**
 * Default configuration that's used when Prettier was enabled in Projen.
 *
 * Generated using `biome migrate prettier`. Some common settings not included here which are in both (Prettier and Eslint) migration configuration
 */
const prettierConfiguration = (): IConfiguration => ({
  formatter: {
    enabled: true,
    useEditorconfig: true,
    formatWithErrors: true,
    indentStyle: 'space',
    indentWidth: 2,
    lineEnding: 'lf',
    lineWidth: 80,
    attributePosition: 'auto',
    bracketSpacing: true,
  },
  organizeImports: {
    enabled: true,
  },
  linter: {
    enabled: false, // Separating clearly linter and formatter
  },
  javascript: {
    formatter: {
      jsxQuoteStyle: 'double',
      quoteProperties: 'asNeeded',
      trailingCommas: 'all',
      semicolons: 'asNeeded',
      arrowParentheses: 'always',
      bracketSameLine: false,
      quoteStyle: 'single',
      attributePosition: 'auto',
      bracketSpacing: true,
    },
  },
})

/**
 * Merge 2 objects deeply.
 *
 * Can't type to actual type, as function is called recursively.
 *
 * Note that explicit undefined would override value from target; missing key (implicit undefined) is not affecting to result.
 *
 * @param target Object to start with
 * @param overrides Object that can override values in target
 * @param mergeArrays Should arrays be merged or overwritten from overrides. Defaults to merging.
 */
const mergeConfigurations = (
  target: any,
  overrides: any,
  mergeArrays = true,
): any => {
  const results = structuredClone(target)

  for (const key in overrides) {
    // Check if override's key is it's own or inherited; we want to handle only it's own.
    if ((overrides as Object).hasOwnProperty(key)) {
      // Handle arrays
      if (overrides[key] instanceof Array && results[key] instanceof Array) {
        if (mergeArrays) {
          // Merge arrays and drop duplicates
          results[key] = [...new Set([...overrides[key], ...results[key]])]
        } else {
          results[key] = overrides[key]
        }
      } else if (
        overrides[key] instanceof Object &&
        results[key] instanceof Object
      ) {
        // Handle objects
        results[key] = mergeConfigurations(
          results[key],
          overrides[key],
          mergeArrays,
        )
      } else {
        // Handle primitive values
        results[key] = overrides[key]
      }
    }
  }

  return results
}

const commonConfiguration: IConfiguration = {
  vcs: { enabled: false, clientKind: 'git', useIgnoreFile: false },
  files: {
    ignoreUnknown: false,
    ignore: [],
  },
}

export const createBiomeConfiguration = (
  options: BiomeOptions,
  projenrcFile?: string,
): IConfiguration => {
  const defaultLinter: IConfiguration = options.linter
    ? eslintConfiguration(projenrcFile)
    : {}
  const defaultFormatter: IConfiguration = options.formatter
    ? prettierConfiguration()
    : {}
  const defaultOrganized: IConfiguration = options.organizeImports
    ? { organizeImports: { enabled: true } }
    : { organizeImports: { enabled: false } }

  const defaultConfig = mergeConfigurations(
    mergeConfigurations(
      mergeConfigurations(defaultFormatter, defaultLinter),
      defaultOrganized,
    ),
    commonConfiguration,
  )

  return mergeConfigurations(
    defaultConfig,
    options.overrides,
    options.mergeArraysInConfiguration,
  )
}
