import { Vitest } from "@nikovirtala/projen-vitest";
import { cdk } from "projen";
import { NodePackageManager } from "projen/lib/javascript";
import { Biome } from "./src";
import { createTypes } from "./src/schema";

const project = new cdk.JsiiProject({
	author: "Juho Saarinen",
	authorAddress: "juho.saarinen@gmail.com",
	defaultReleaseBranch: "main",
	jsiiVersion: "~5.8.0",
	license: "MIT",
	name: "projen-biome",
	projenrcTs: true,
	repositoryUrl: "https://github.com/Hi-Fi/projen-biome.git",
	packageManager: NodePackageManager.NPM,
	renovatebot: true,
	depsUpgradeOptions: {
		workflow: false,
	},
	bundledDeps: ["@biomejs/biome"],
	deps: ["@biomejs/biome"],
	devDeps: ["@nikovirtala/projen-vitest", "json-schema-to-typescript"],
	peerDeps: ["projen", "constructs"],
	jest: false,
	// Use biome (this project) instead of eslint and prettier
	eslint: false,
	prettier: false,

	// deps: [],                /* Runtime dependencies of this module. */
	// description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
	// devDeps: [],             /* Build dependencies for this module. */
	// packageName: undefined,  /* The "name" in package.json. */
});

// const typesTask = project.addTask("parse-biome-types", {
// 	exec: "npx --package=json-schema-to-typescript json2ts --input node_modules/@biomejs/biome/configuration_schema.json --output src/biome-configuration.ts",
// });

// project.defaultTask?.spawn(typesTask);

new Vitest(project);
new Biome(project, {
	formatter: true,
	organizeImports: true,
	overrides: {
		files: {
			ignore: ["src/biome-configuration.ts"],
		},
	},
});

project.postSynthesize = async () => {
	await createTypes();
};

project.synth();
