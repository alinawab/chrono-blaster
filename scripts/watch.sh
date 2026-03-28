#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
make-gif --watch --assets "$ROOT/assets" --readme "$ROOT/README.md"
