# freeml-scraper

Scrape freeml.com


## Install

```
yarn install
```

## USAGE

`.env` にログインID/パス/対象とするメーリングリスト名を指定

```
FREEML_EMAIL=your@example.com
FREEML_PASSWORD=your_password
FREEML_SLUG=your_mailing_list
```

```
yarn start
```

`dest/` 以下にhtml,pdf,pngファイルが作成される。1リクエストごとに10秒程度待つので、1000件メールがある場合は10000秒以上かかる。
