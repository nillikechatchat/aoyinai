#!/bin/sh
set -eu

if [ -z "${CHROME_PATH:-}" ]; then
  CHROME_PATH="$(python3 -c 'from playwright.sync_api import sync_playwright; p = sync_playwright().start(); print(p.chromium.executable_path); p.stop()')"
  export CHROME_PATH
fi

lhci autorun --config=.lighthouserc.json
lhci autorun --config=.lighthouserc.mobile.json
