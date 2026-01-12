const { build, context } = require("esbuild");

const buildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  outdir: "dist",
  sourcemap: true,
  external: ["fsevents"],
  format: "cjs",
  minify: process.env.NODE_ENV === "production",
};

async function buildApp() {
  try {
    await build(buildOptions);
    console.log("✅ Build completed successfully");
    console.log("📁 Built files:");
    console.log("   - dist/index.js");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

async function watchApp() {
  try {
    const ctx = await context(buildOptions);
    await ctx.watch();
    console.log("👀 Watching for changes...");
    console.log("📁 Watching files:");
    console.log("   - src/index.ts");

    // Keep the process alive
    process.on("SIGINT", async () => {
      await ctx.dispose();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Watch setup failed:", error);
    process.exit(1);
  }
}

// Check if this is a watch command
const isWatch = process.argv.includes("--watch");

if (isWatch) {
  watchApp();
} else {
  buildApp();
}
