.PHONY: dev build test coverage lint typecheck clean

dev:
	npm run dev

build:
	npm run build

test:
	npm test

coverage:
	npm run test:coverage

lint:
	npm run lint

typecheck:
	npm run typecheck

clean:
	rm -rf dist coverage node_modules/.cache
