.PHONY: build lint lint-format format

build:
	deno --allow-write --allow-read --allow-env --allow-run bin/build.ts

lint: lint-format
	deno lint .

lint-format:
	deno fmt --check .

format:
	deno fmt .
