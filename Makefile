.PHONY: help all pre-pr test lint typecheck docs build

help:
	@echo "Available targets:"
	@echo "  make all        - Run all checks (test, lint, typecheck, docs, build)"
	@echo "  make pre-pr     - Run all checks before creating PR (alias for 'all')"
	@echo "  make test       - Run unit tests"
	@echo "  make lint       - Run ESLint"
	@echo "  make typecheck  - Run TypeScript type checking"
	@echo "  make docs       - Validate OpenSpec documents"
	@echo "  make build      - Build userscript"

pre-pr: all

all: test lint typecheck docs build

test:
	@echo "test..."
	npm run test

lint:
	@echo "lint..."
	npm run lint

typecheck:
	@echo "ct..."
	npm run check-types

docs:
	@echo "docs..."
	openspec validate --strict --all

build:
	@echo "build..."
	IS_UNSTABLE=true npm run build
