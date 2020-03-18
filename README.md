## Install dependencies
```bash
nvm use
npm ci
```

## Use environment variables
### Either create .env
Ideal for development environment

```bash
HUGO_TITLE="Site Title"
HUGO_PARAMS_PAGE_TITLE_PREFIX=""
HUGO_LANGUAGECODE="en-gb"
HUGO_THEME="grid"
HUGO_PARAMS_API="https://admindomain/api/"
HUGO_PARAMS_CACHEDOMAIN="Thumbnail.Cache.Domain"
HUGO_PARAMS_TAGLINE="Site Tagline"
HUGO_PARAMS_THEMECOLOR="white"
```
* __HUGO_TITLE__: Title of the site
* __HUGO_PARAMS_PAGE_TITLE_PREFIX__: Title to use in the &lttitle&gt tag. Defaults to _HUGO_TITLE_
* __HUGO_LANGUAGECODE__: Content language
* __HUGO_THEME__: Theme to use. Currently only _grid_ is available
* __HUGO_PARAMS_API__: URL for public API of content. _https://manager-domain/api/_
* __HUGO_PARAMS_CACHEDOMAIN__: image Cache Domain
* __HUGO_PARAMS_TAGLINE__: Site's Tagline
* __HUGO_PARAMS_THEMECOLOR__: Theme variation. _white_ (default) or _grey_

You can replace any variable from _config.toml_, not only the ones listed above

### Or export variables
Ideal for production build or CI/CD

Exported variables have precedence on variables defined in _.env_
```bash
export HUGO_TITLE="Site Title"
...
```

## Build Album pages from API
```bash
npm run content
```

## Build site
```bash
npm run build
```

#3 Start dev server
```bash
npm run server
```
