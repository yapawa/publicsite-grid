#!/usr/bin/env bash

if [ -f .env ]; then
  . ./.env

  if [ -n "$AWS_PROFILE" ]; then
    export AWS_PROFILE=$AWS_PROFILE
  fi
fi

if [ -n "$AWS_REGION" ]; then
  export AWS_REGION=$AWS_REGION
fi

aws configure set default.s3.max_concurrent_requests 40
aws configure set default.s3.max_queue_size 10000
aws configure set default.s3.multipart_threshold 64MB
aws configure set default.s3.multipart_chunksize 16MB

aws s3 sync --delete --exclude "_headers" --exclude "_redirects" --cache-control "max-age=31536000" --metadata file://public/_headers --acl public-read public/ s3://$S3_BUCKET/
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION --paths '/*'
rm -f /tmp/emptyredirect
touch /tmp/emptyredirect

cat public/_redirects | grep -v "#.*" | while read line; do
  from=$(echo $line | awk '{print $1}')
  to=$(echo $line | awk '{print $2}')
  aws s3 cp --cache-control \"max-age=31536000\" --website-redirect $to --acl public-read /tmp/emptyredirect s3://${S3_BUCKET}${from}index.html
done
