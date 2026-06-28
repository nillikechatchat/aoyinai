#!/bin/sh
set -e

HUGO_VERSION="0.160.0"
HUGO_TARBALL="hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
HUGO_URL="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${HUGO_TARBALL}"
HUGO_DIR="$(pwd)/.hugo_bin"

echo "==> Downloading Hugo ${HUGO_VERSION}"
curl -fSL --retry 3 -o /tmp/${HUGO_TARBALL} ${HUGO_URL}

echo "==> Extracting to ${HUGO_DIR}"
mkdir -p ${HUGO_DIR}
tar -xzf /tmp/${HUGO_TARBALL} -C ${HUGO_DIR}
chmod +x ${HUGO_DIR}/hugo

export PATH="${HUGO_DIR}:$PATH"
${HUGO_DIR}/hugo version

echo "==> Building site"
${HUGO_DIR}/hugo --gc --minify

echo "==> Build complete"
