#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
make-gif --assets "$ROOT/assets" --readme "$ROOT/README.md"
