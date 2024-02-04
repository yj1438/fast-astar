import path from "path";
import fs from "fs";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import { swc, defineRollupSwcOption } from "rollup-plugin-swc3";

const { NODE_ENV } = process.env;

let pkgJson = fs.readFileSync(path.resolve("package.json"), "utf-8");
pkgJson = JSON.parse(pkgJson);

const extensions = [".js", ".ts"];
const mainFields = NODE_ENV === "development" ? ["module", "main"] : undefined;

const commonPlugins = [
  resolve({ extensions, preferBuiltins: true, mainFields }),
  swc(
    defineRollupSwcOption({
      include: /\.[mc]?[jt]sx?$/,
      exclude: /node_modules/,
      jsc: {
        loose: true,
        externalHelpers: true,
        target: "es5"
      },
      sourceMaps: true
    })
  ),
  commonjs(),
  replace({
    preventAssignment: true,
    __buildVersion: pkgJson.version
  })
];

const peerDependencies = Object.assign(pkgJson.peerDependencies ?? {});
const peerDependenciesExternal = Object.keys(peerDependencies);
const dependencies = Object.assign(pkgJson.dependencies ?? {});
const dependenciesExternal = Object.keys(dependencies);

export default {
  input: path.resolve("src", "index.ts"),
  external: [...peerDependenciesExternal, ...dependenciesExternal],
  output: [
    {
      format: "es",
      file: path.join(pkgJson.module), // 'dist/module.js',
      sourcemap: true
    },
    {
      format: "commonjs",
      file: path.join(pkgJson.main), // 'dist/main.js',
      sourcemap: true
    }
  ],
  plugins: commonPlugins
}
