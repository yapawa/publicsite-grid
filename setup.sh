#!/usr/bin/env bash

if [ -f .env ]; then
  . ./.env
fi

if [ -n "$AWS_PROFILE" ]; then
  export AWS_PROFILE=$AWS_PROFILE
fi
if [ -n "$AWS_REGION" ]; then
  export AWS_REGION=$AWS_REGION
fi

if [ -z ${DOMAIN_NAME} ]; then
  echo "Missing domain name"
  return 0
fi

STACK_NAME=${DOMAIN_NAME//\./-}

declare -A parameters

parameters["domainName"]="$DOMAIN_NAME"
parameters["hostedZoneId"]="$HOSTED_ZONE_ID"
parameters["certificateArn"]="$CERTIFICATE_ARN"
parameters["hugoTitle"]="$HUGO_TITLE"
parameters["hugoParamsPageTitlePrefix"]="$HUGO_PARAMS_PAGETITLEPREFIX"
parameters["hugoParamsTagline"]="$HUGO_PARAMS_TAGLINE"
parameters["hugoTheme"]="$HUGO_THEME"
parameters["hugoParamsThemeColor"]="$HUGO_PARAMS_THEMECOLOR"
parameters["hugoLanguageCode"]="$HUGO_LANGUAGECODE"
parameters["hugoParamsApi"]="$HUGO_PARAMS_API"
parameters["hugoParamsCacheDomain"]="$HUGO_PARAMS_CACHEDOMAIN"
parameters["hugoGoogleAnalytics"]="$HUGO_GOOGLEANALYTICS"
parameters["webClientId"]="$WEBCLIENTID"

s_parameters=''
for i in "${!parameters[@]}" ; do
  s_parameters=$s_parameters" "$(printf "%s='%s'" $i "${parameters[${i}]}")
done
s_parameters=${s_parameters:1}

cmd="aws cloudformation deploy --no-fail-on-empty-changeset --stack-name $STACK_NAME --template-file cloudformation/template.json --capabilities CAPABILITY_IAM --parameter-overrides $s_parameters"
eval $cmd

aws codebuild start-build --project-name $STACK_NAME
