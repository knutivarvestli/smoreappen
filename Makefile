# Run from WSL (Ubuntu). Windows group policy on this machine blocks locally
# built executables, so everything runs in Docker.

.PHONY: up down logs migrate test lint

up:
	docker compose up -d --build app

down:
	docker compose down

logs:
	docker compose logs -f app

migrate:
	docker compose run --rm --build migrate

test:
	docker compose --profile test run --rm test

lint:
	docker compose --profile test run --rm test sh -c 'test -z "$$(gofmt -l .)" || (gofmt -l . && exit 1); go vet ./...'

