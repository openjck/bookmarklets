.PHONY: build format lint lint-types lint-format

build:
	deno --allow-write --allow-read --allow-env --allow-run bin/build.ts

format:
	deno fmt

lint: lint-format lint-types
	deno lint

lint-types:
	deno check

lint-format:
	deno fmt --check
