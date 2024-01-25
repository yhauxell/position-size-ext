# Trading Position Size Chrome extension

This extension allows to calculate on-the-fly position sizes for your trades without leaving the trading interface.

The project is started after founding some crypto exchanges does not provide a proper position size calculator, the calculator is not tied to crypto at the moment so can be used for any asset class. Leverage is not mandatory to set


> Chrome extension tool built with Vite + React + shadcn/ui, and Manifest v3

## Installing

1. Check if your `Node.js` version is >= **14**.
2. Change or configurate the name of your extension on `src/manifest`.
3. Run `yarn install` to install the dependencies.

## Developing

run the command

```shell
$ cd position-size-ext

$ yarn dev
```

### Chrome Extension Developer Mode

1. set your Chrome browser 'Developer mode' up
2. click 'Load unpacked', and select `position-size-ext/build` folder

### Nomal FrontEnd Developer Mode

1. access `http://localhost:3000/`
2. when debugging popup page, open `http://0.0.0.0:3000//popup.html`
3. when debugging options page, open `http://0.0.0.0:3000//options.html`

## Packing

After the development of your extension run the command

```shell
$ npm run build
```

Now, the content of `build` folder will be the extension ready to be submitted to the Chrome Web Store. Just take a look at the [official guide](https://developer.chrome.com/webstore/publish) to more infos about publishing.

---

 Scaffolding generated using this amazing tool: [create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext)
