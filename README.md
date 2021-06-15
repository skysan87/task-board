## 概要

Nuxt.js(Webアプリ)のデスクトップ化(Electron)


## 機能

### Nuxt.js(webフォルダ)

* todolistアプリ
  * [nuxt-todolist](https://github.com/skysan87/nuxt-todolist)の移植
  * データ永続化: IndexedDB

* appフォルダ: electron
  * webアプリのデスクトップ化


## プロジェクト構成

```
.
├──app
│   ├── build         ・・・electron-builderの出力フォルダ
│   ├── dist          ・・・nuxt generateの出力フォルダ
│   ├── node_modules  ・・・Electronプロジェクトのモジュール
│   ├── package.json
│   └── src
│       ├── main                  ・・・mainプロセス群
│       └── renderer -> ../../web ・・・rendererプロセス群 - Nuxt.jsプロジェクトへのリンク
└── web
    ├── (Nuxt.jsの規定フォルダ群)
    ├── node_modules  ・・・Nuxt.jsプロジェクトのモジュール
    ├── nuxt.config.js
    ├── package.json
    └── tsconfig.json
```


## インストール

```bash
# appフォルダ
$ cd app
$ npm install

# webフォルダ
$ cd web
$ npm install
```


## ビルド

```bash
# Nuxt.jsプロジェクト開発時(webフォルダ)
$ npm run dev
# ↑(ローカルサーバ) + electron開発時(appフォルダ)
$ npm run dev

# nuxt generate & electron実行(appフォルダ)
$ npm run build:renderer
$ npm run start

# electron 実行ファイル作成(Macの場合)
$ npm run build:renderer
$ npm run build:mac
```


## 補足

* シンボリックリンク設定

```bash
$ cd app/src
$ ln -s ../../web renderer
```
