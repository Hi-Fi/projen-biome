import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compileJsiiForTest } from "jsii";
import { describe, expect, it } from "vitest";
import { createTypes } from "../src/schema";

describe("JSON to Types converter", () => {
	it("creates JSII compliant types", async () => {
		const dir = mkdtempSync(join(tmpdir(), "jsii"));
		const testFile = join(dir, "types.ts");

		await createTypes(testFile);
		const types = readFileSync(testFile, { encoding: "utf-8" });

		expect(compileJsiiForTest(types)).toBeDefined();
	});
});
