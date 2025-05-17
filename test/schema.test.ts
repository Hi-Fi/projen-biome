import { mkdtempSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createTypes } from '../src/schema'
import { compileJsiiForTest } from 'jsii'
import { tmpdir } from "node:os";

describe('JSON to Types converter', () => {
    it('creates JSII compliant types', async () => {
        const dir = mkdtempSync(join(tmpdir(), 'jsii'));
        const testFile = join(dir, 'types.ts')

        await createTypes(testFile);
        const types = readFileSync(testFile, { encoding: 'utf-8'});

        expect(compileJsiiForTest(types)).toBeDefined()
    })
})