import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unplugin-tailwindcss/vite'
import {quasar} from "@quasar/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        vue(),
        Unocss(),
        quasar({
            // sassVariables: 'src/quasar-variables.sass'
        }),
    ],
    css: {
        postcss: {
            plugins: [
                // require('tailwindcss'),
                // require('autoprefixer'),
            ]
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('../src', import.meta.url))
        }
    },
    server: {
        host: "0.0.0.0",
        port: 8010
    }
})