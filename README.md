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
HUGO_PARAMS_PAGETITLEPREFIX=""
HUGO_LANGUAGECODE="en-gb"
HUGO_THEME="grid"
HUGO_PARAMS_API="https://admindomain/api/"
HUGO_PARAMS_CACHEDOMAIN="Thumbnail.Cache.Domain"
HUGO_PARAMS_TAGLINE="Site Tagline"
HUGO_PARAMS_THEMECOLOR="white"
AWS_PROFILE=awsprofile
AWS_REGION=aws-region
DOMAIN_NAME=domainName
CERTIFICATE_ARN=arn:aws:acm:us-east-1:xxxxx:certificate/yyyyyy
HOSTED_ZONE_ID=hostedZoneId
HUGO_GOOGLEANALYTICS=""
```
* __HUGO_TITLE__: Title of the site
* __HUGO_PARAMS_PAGETITLEPREFIX__: Title prefix to use in the &lttitle&gt tag
* __HUGO_LANGUAGECODE__: Content language
* __HUGO_THEME__: Theme to use. Currently only _grid_ is available
* __HUGO_PARAMS_API__: URL for public API of content. _https://manager-domain/api/_
* __HUGO_PARAMS_CACHEDOMAIN__: image Cache Domain
* __HUGO_PARAMS_TAGLINE__: Site's Tagline
* __HUGO_PARAMS_THEMECOLOR__: Theme variation. _white_ (default) or _grey_
* __AWS_PROFILE__: AWS Profile to use
* __AWS_REGION__: AWS Region
* __DOMAIN_NAME__: Domain name
* __CERTIFICATE_ARN__: ACM certificate ARN
* __HOSTED_ZONE_ID__: Route53 hosted ZoneId for _domain name_
* __HUGO_GOOGLEANALYTICS__: Google Analytics Tracking Code

### Or export variables
Ideal for production build or CI/CD

Exported variables have precedence on variables defined in _.env_
```bash
export HUGO_TITLE="Site Title"
...
```

## Deploy Stack
```bash
bash setup.sh
```
This will create an S3 Bucket, a Cloudformation Distribution and a CodeBuild Project to deploy

## Deploy Site
```bash
aws codebuild start-build --project-name $DOMAIN_NAME
```

## Build Album pages from API
```bash
npm run content
```

## Build site
```bash
npm run build
```

## Start dev server
```bash
npm run server
```
