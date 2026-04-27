import { build } from "esbuild";
import { dtsPlugin } from "esbuild-plugin-d.ts";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDir = resolve(repoRoot, "tests/smoke/fixtures");
const distDir = resolve(repoRoot, "tests/smoke/dist");
const packageEntry = fileURLToPath(import.meta.resolve("esbuild-plugin-d.ts"));
const tsconfig = resolve(fixtureDir, "tsconfig.json");

function section(title) {
    console.log(`\n=== ${title} ===`);
}

function pathFromRoot(path) {
    return relative(repoRoot, path);
}

function readOutput(path, expectedSnippets) {
    if (!existsSync(path)) {
        throw new Error(
            `Expected output was not written: ${pathFromRoot(path)}`,
        );
    }

    const contents = readFileSync(path, "utf8");

    for (const snippet of expectedSnippets) {
        if (!contents.includes(snippet)) {
            throw new Error(
                `Expected ${pathFromRoot(path)} to contain ${JSON.stringify(snippet)}`,
            );
        }
    }

    console.log(`\n--- ${pathFromRoot(path)} ---`);
    console.log(contents.trimEnd());

    return contents;
}

async function runBasicSmoke() {
    section("Basic declaration emit");

    await build({
        entryPoints: [resolve(fixtureDir, "basic.ts")],
        outdir: resolve(distDir, "basic"),
        tsconfig,
        logLevel: "info",
        plugins: [dtsPlugin({ tsconfig })],
    });

    readOutput(resolve(distDir, "basic/basic.d.ts"), [
        "export interface BasicSmokeResult",
        "export declare function createBasicSmokeResult",
        "export type { SmokeUser };",
    ]);
}

async function runBundledSmoke() {
    section("Experimental declaration bundling");

    await build({
        entryPoints: {
            api: resolve(fixtureDir, "bundle.ts"),
            secondary: resolve(fixtureDir, "secondary.ts"),
        },
        outdir: resolve(distDir, "bundled"),
        tsconfig,
        bundle: true,
        logLevel: "info",
        plugins: [dtsPlugin({ tsconfig, experimentalBundling: true })],
    });

    readOutput(resolve(distDir, "bundled/api.d.ts"), [
        "export declare function createBasicSmokeResult",
        "export type SmokeStatus",
        "export {};",
    ]);

    readOutput(resolve(distDir, "bundled/secondary.d.ts"), [
        "export interface SecondarySmokeReport",
        "export declare function createSecondarySmokeReport",
        "export {};",
    ]);
}

section("Smoke setup");
console.log(`Using package export: ${pathFromRoot(packageEntry)}`);
console.log(`Fixture tsconfig: ${pathFromRoot(tsconfig)}`);
console.log(`Output directory: ${pathFromRoot(distDir)}`);

rmSync(distDir, { recursive: true, force: true });

await runBasicSmoke();
await runBundledSmoke();

section("Smoke complete");
console.log(`Outputs left in ${pathFromRoot(distDir)}`);
