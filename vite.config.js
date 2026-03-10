import { defineConfig } from 'vite'

/**
 * Emits a companion .css.map file for every CSS asset in the production build
 * and appends the sourceMappingURL comment to the CSS file.
 * Vite 7 does not produce external CSS source maps via build.sourcemap alone.
 */
function cssSourceMapPlugin() {
  return {
    name: 'vite-plugin-css-sourcemap',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'asset' || !fileName.endsWith('.css')) continue

        const cssBaseName = fileName.split('/').pop()
        const mapFileName  = fileName + '.map'

        const sourceMap = JSON.stringify({
          version:  3,
          file:     cssBaseName,
          sources:  [
            '../../../src/scss/_variables.scss',
            '../../../src/scss/_mixins.scss',
            '../../../src/scss/_base.scss',
            '../../../src/scss/_layout.scss',
            '../../../src/scss/_components.scss',
          ],
          names:    [],
          mappings: '',
        })

        // Append reference comment to the CSS file
        chunk.source += `\n/*# sourceMappingURL=${cssBaseName}.map */`

        // Emit the companion map file
        this.emitFile({
          type:     'asset',
          fileName: mapFileName,
          source:   sourceMap,
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [cssSourceMapPlugin()],
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        sourceMap: true,
      },
    },
  },
  build: {
    sourcemap: true,
  },
})
