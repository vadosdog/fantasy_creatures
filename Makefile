# See:
# http://www.gnu.org/software/make/manual/make.html

include docker/.env

EXEC_PHP      = docker compose exec app
EXEC_DB       = docker compose exec postgres
EXEC_REDIS    = docker compose exec redis
ARTISAN       = $(EXEC_PHP) php artisan
COMPOSER      = $(EXEC_PHP) composer
COMPOSE_FILE  = compose.dev.yaml
DOCKER_F      = $(COMPOSE_FILE)
DATE          = $(shell date +"%Y-%m-%d")


# This allows us to accept extra arguments
%:
	@:
args = `arg="$(filter-out $@,$(MAKECMDGOALS))" && echo $${arg:-${1}}`

### project setup
rebuild:
	docker compose -f $(DOCKER_F) down --remove-orphans \
	&& docker compose -f $(DOCKER_F) build --parallel \
	&& docker compose -f $(DOCKER_F) up -d \

down:
	docker compose down

up:
	docker compose -f $(DOCKER_F) up -d \

php-shell:
	docker compose -f $(DOCKER_F) exec workspace bash

redis-cli:
	$(EXEC_REDIS) sh

optimize:
	$(ARTISAN) optimize

tinker:
	$(ARTISAN) tinker

pint:
	$(EXEC_PHP) ./vendor/bin/pint

artisan-run:
	$(ARTISAN) $(call args,help)

migrate:
	$(ARTISAN) migrate

migrate-rollback:
	$(ARTISAN) migrate:rollback

migration:
	$(ARTISAN) make:migration

composer-install:
	$(COMPOSER) install

# Refresh composer.lock hash
composer-update-hash:
	$(COMPOSER) update --lock

composer-dump-autoload:
	$(COMPOSER) dump-autoload

download-logistics-dump:
	mkdir -p ./docker/pg/dumps \
	&& cd ./docker/pg/dumps \
	&& curl -o dump.custom -u gfbackup:Ghf_Vbc#1 https://backups.gftech.ru/short/logistic/logistic_short.sql.xz \

create-db-logistics:
	docker compose down --remove-orphans \
	&& docker volume rm logistics_pg-data \
	&& docker compose -f $(DOCKER_F) up -d \
	&& sleep 5 \
	&& $(EXEC_DB) sh -c "pg_restore -v -U postgres -C -d logisticsgf dumps/dump.custom"

unittest:
	$(EXEC_PHP) vendor/bin/paratest

reset-roles:
	$(ARTISAN) db:seed --class=RolesAndPermissions

db-seed:
	cd ./docker \
    && $(ARTISAN) db:seed

tail-info:
	$(EXEC_PHP) tail -f storage/logs/laravel.log -n 500

tail-logs:
	docker compose -f $(DOCKER_F) logs -f

openapi-gen:
	$(ARTISAN) openapi:generate > ../docs/swagger.json
