#!/bin/sh
# MySQL Health Check Script - Simple port check
# This is reliable and doesn't require MySQL client tools

if (echo > /dev/tcp/127.0.0.1/3306) 2>/dev/null; then
  exit 0
fi

# If TCP check fails, try with netcat as fallback
if command -v nc &> /dev/null; then
  if nc -z 127.0.0.1 3306 2>/dev/null; then
    exit 0
  fi
fi

exit 1
