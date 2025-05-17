import { Component, JsonFile, ProjenrcFile } from "projen";
import { Eslint, type NodeProject, Prettier } from "projen/lib/javascript";
import { TypeScriptProject } from "projen/lib/typescript";
import type { IConfiguration } from "./biome-configuration";
export * from "./biome-configuration";

export interface BiomeOptions {
	/**
	 * Version of Biome to use
	 *
	 * @default "^1"
	 */
	readonly version?: string;
	/**
	 * Enable linting. Replaces Eslint.
	 *
	 * @default true
	 */
	readonly linter?: boolean;
	/**
	 * Enable code formatter. Replaces mainly Prettier
	 *
	 * @default false
	 */
	readonly formatter?: boolean;
	/**
	 * Enable import sorting/organizing. Replaces mainly Prettier
	 *
	 * @default false
	 */
	readonly organizeImports?: boolean;
	/**
	 * Full Biome configuration. Note that this configuration dictates the final outcome is value is set.
	 *
	 * @example if linter is disabled on main level, it can be enabled on fullConfiguration.formatter.enabled.
	 */
	readonly overrides?: IConfiguration;
}

export class Biome extends Component {
	public static of(project: NodeProject): Biome | undefined {
		const isBiome = (c: Component): c is Biome => c instanceof Biome;
		return project.components.find(isBiome);
	}

	private readonly configFile: string;
	private readonly version: string;
	private readonly formatterEnabled: boolean;
	private readonly linterEnabled: boolean;
	private readonly importOrganizedEnabled: boolean;

	constructor(project: NodeProject, options: BiomeOptions = {}) {
		super(project);
		this.configFile = "biome.jsonc";
		this.version = options.version ?? "^1";
		this.formatterEnabled = options.formatter ?? false;
		this.linterEnabled = options.linter ?? true;
		this.importOrganizedEnabled = options.organizeImports ?? false;

		if (project.name !== "projen-biome") {
			project.addDevDeps(`@biomejs/biome@${this.version}`);
		}

		const biomeConfiguration = structuredClone(options.overrides ?? {});

		if (biomeConfiguration.formatter?.enabled === undefined) {
			if (biomeConfiguration.formatter) {
				biomeConfiguration.formatter.enabled = this.formatterEnabled;
			} else {
				biomeConfiguration.formatter = {
					enabled: this.formatterEnabled,
				};
			}
		}

		if (biomeConfiguration.linter?.enabled === undefined) {
			if (biomeConfiguration.linter) {
				biomeConfiguration.linter.enabled = this.linterEnabled;
			} else {
				biomeConfiguration.linter = {
					enabled: this.linterEnabled,
				};
			}
		}

		if (biomeConfiguration.organizeImports?.enabled === undefined) {
			if (biomeConfiguration.organizeImports) {
				biomeConfiguration.organizeImports.enabled =
					this.importOrganizedEnabled;
			} else {
				biomeConfiguration.organizeImports = {
					enabled: this.importOrganizedEnabled,
				};
			}
		}

		new JsonFile(this, this.configFile, {
			obj: biomeConfiguration,
			committed: true,
			allowComments: true,
			marker: true,
		});

		const localTask = this.createLocalBiomeTask();
		project.testTask.spawn(localTask);
	}

	public override preSynthesize(): void {
		super.preSynthesize();

		for (const component of this.project.components) {
			if (component instanceof Eslint && this.linterEnabled) {
				throw new Error("Biome linter should not be used together with Eslint");
			}
			if (
				component instanceof Prettier &&
				(this.formatterEnabled || this.importOrganizedEnabled)
			) {
				throw new Error(
					"Biome formatter should not be used together with Prettier",
				);
			}
		}
	}

	private createLocalBiomeTask() {
		const targetDirs: string[] = [];
		const projenrcFile = this.project.components.find(
			(component) => component instanceof ProjenrcFile,
		)?.filePath;
		projenrcFile && targetDirs.push(projenrcFile);

		if (this.project instanceof TypeScriptProject) {
			targetDirs.push(this.project.srcdir);
			targetDirs.push(this.project.testdir);
		}

		return this.project.addTask("biome", {
			description: "Runs Biome against the codebase",
			steps: [
				{
					exec: `biome check --write ${targetDirs.join(" ")}`,
				},
			],
		});
	}
}
