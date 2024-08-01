const esbuild = require("esbuild");
const livereload = require("livereload");
const chokidar = require("chokidar");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    build.onStart(() => {
      console.log("[watch] build started");
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(
          `    ${location.file}:${location.line}:${location.column}:`
        );
      });
      console.log("[watch] build finished");
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "node",
    outfile: "dist/extension.js",
    external: ["vscode"],
    logLevel: "silent",
    plugins: [
      /* add to the end of plugins array */
      esbuildProblemMatcherPlugin,
    ],
  });

  const reactCtx = await esbuild.context({
    entryPoints: ["react-app/src/index.tsx"],
    bundle: true,
    format: "iife",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "browser",
    outfile: "react-app/dist/bundle.js",
    logLevel: "silent",
    plugins: [esbuildProblemMatcherPlugin],
  });

  if (watch) {
    await ctx.watch();
    await reactCtx.watch();

    // Setup livereload server
    const lrServer = livereload.createServer();
    lrServer.watch("react-app/dist");

    // Watch for changes in src directory
    chokidar.watch("react-app/src").on("all", async () => {
      await reactCtx.rebuild();
      lrServer.refresh("react-app/dist/bundle.js");
    });
  } else {
    await ctx.rebuild();
    await reactCtx.rebuild();
    await ctx.dispose();
    await reactCtx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
