#!/bin/bash

# Check if GCMB_PASSWORD is set

if [ -z "$GCMB_PASSWORD" ]; then
  echo "Error: GCMB_PASSWORD is not set."
  exit 1
fi

mosquitto_pub \
  -h local.gcmb.io \
  -p 8883 \
  -i medium/medium-firehose/data-publisher/pub \
  -u medium/medium-firehose/data-publisher \
  -P ${GCMB_PASSWORD} \
  -t medium/medium-firehose/all \
  -f example-message.xml \
  -d
