# See:
# http://www.gnu.org/software/make/manual/make.html

include docker/.env

EXEC_PHP      = docker compose exec app
EXEC_DB       = docker compose exec postgres
EXEC_REDIS    = docker compose exec redis
EXEC_NODE     = docker compose exec node
ARTISAN       = $(EXEC_PHP) php artisan
COMPOSER      = $(EXEC_PHP) composer
DOCKER_F      = $(COMPOSE_FILE)
DATE          = $(shell date +"%Y-%m-%d")


# This allows us to accept extra arguments
%:
	@:
args = `arg="$(filter-out $@,$(MAKECMDGOALS))" && echo $${arg:-${1}}`

### project setup
rebuild:
	cd ./docker \
	&& docker compose -f $(DOCKER_F) down --remove-orphans \
	&& docker compose -f $(DOCKER_F) build --parallel \
	&& docker compose -f $(DOCKER_F) up -d \

down:
	cd ./docker \
	&& docker compose down

up:
	cd ./docker \
	&& docker compose -f $(DOCKER_F) up -d \

php-shell:
	cd ./docker \
	&& $(EXEC_PHP) sh

node-shell:
	cd ./docker \
	&& $(EXEC_NODE) sh

redis-cli:
	cd ./docker \
	&& $(EXEC_REDIS) sh

optimize:
	cd ./docker \
	&& $(ARTISAN) optimize

tinker:
	cd ./docker \
	&& $(ARTISAN) tinker

pint:
	cd ./docker \
	&& $(EXEC_PHP) ./vendor/bin/pint

artisan-run:
	cd ./docker \
	&& $(ARTISAN) $(call args,help)

migrate:
	cd ./docker \
	&& $(ARTISAN) migrate

migrate-rollback:
	cd ./docker \
	&& $(ARTISAN) migrate:rollback

migration:
	cd ./docker \
	&& $(ARTISAN) make:migration

composer-install:
	cd ./docker \
	&& $(COMPOSER) install

# Refresh composer.lock hash
composer-update-hash:
	cd ./docker \
	&& $(COMPOSER) update --lock

composer-dump-autoload:
	cd ./docker \
	&& $(COMPOSER) dump-autoload

unittest:
	cd ./docker \
	&& $(EXEC_PHP) vendor/bin/paratest

db-seed:
	cd ./docker \
    && $(ARTISAN) db:seed

tail-info:
	cd ./docker \
	&& $(EXEC_PHP) tail -f storage/logs/laravel.log -n 500

tail-logs:
	cd ./docker \
	&& docker compose -f $(DOCKER_F) logs -f

node-logs:
	cd ./docker \
	&& docker compose -f $(DOCKER_F) logs -f node

openapi-gen:
	cd ./docker \
	&& $(ARTISAN) openapi:generate > ../docs/swagger.json
