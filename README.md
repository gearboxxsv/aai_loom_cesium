# aai-loom-mevn

Created using the methods described in [this tutorial](https://appdividend.com/2022/10/27/mevn-stack/), modified somewhat using more up-to-date setup and config instructions from [the Vue.js Quick Start guide](https://vuejs.org/guide/quick-start.html#creating-a-vue-application), as well as a few other tweaks to update to ES6 code, especially in the server routing.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
cd api
npm install
```

### Compile and Hot-Reload for Development

```sh
cd api
nodemon server (if this doesn't work, npx nodemon server)

(In separate terminal)
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
