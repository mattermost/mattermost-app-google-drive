NPM ?= npm

define GetFromPkg
$(shell node -p "require('./src/manifest.json').$(1)")
endef

APP_ID      := $(call GetFromPkg, app_id)
VERSION     := $(call GetFromPkg, version)
BUNDLE_NAME := app_$(APP_ID)_$(VERSION)

DIST_DIR := dist
DEFAULT_BUNDLE_NAME := bundle

# should be the same as the one in tsconfig.json
TS_DIST_DIR := dist-ts

.PHONY: build dist watch clean help

## build: build the app
build: node_modules
	$(NPM) run build

## dist: creates the bundle file for dev deployment
dist-dev: build
	rm -rf $(DIST_DIR)/$(DEFAULT_BUNDLE_NAME) && mkdir -p $(DIST_DIR)/$(DEFAULT_BUNDLE_NAME)	
	mv $(TS_DIST_DIR)/* $(DIST_DIR)/$(DEFAULT_BUNDLE_NAME)
	rm -r $(TS_DIST_DIR)
	mv node_modules $(DIST_DIR)/$(DEFAULT_BUNDLE_NAME)
	cp -r src/locales $(DIST_DIR)/$(DEFAULT_BUNDLE_NAME)
	cp src/manifest.json $(DIST_DIR)
	cp -r static $(DIST_DIR)
	cd $(DIST_DIR) ; \
		zip -rm $(DEFAULT_BUNDLE_NAME).zip $(DEFAULT_BUNDLE_NAME) ; \
		zip -rm ../$(BUNDLE_NAME).zip manifest.json static $(DEFAULT_BUNDLE_NAME).zip
	rm -rf ./$(DIST_DIR)/* && mv ./$(BUNDLE_NAME).zip ./$(DIST_DIR)	

## dist: creates the bundle file for deployment
dist: build
	rm -rf ./$(DIST_DIR)/* && mkdir -p ./$(DIST_DIR)/$(DEFAULT_BUNDLE_NAME)
	mv $(TS_DIST_DIR)/* $(DIST_DIR)/$(DEFAULT_BUNDLE_NAME)
	rm -r $(TS_DIST_DIR)
	mv node_modules $(DIST_DIR)/$(DEFAULT_BUNDLE_NAME)
	cp -r src/locales $(DIST_DIR)/$(DEFAULT_BUNDLE_NAME)
	cp src/manifest.json $(DIST_DIR)
	cp -r static $(DIST_DIR)
	cd $(DIST_DIR) ; \
		zip -rm $(DEFAULT_BUNDLE_NAME).zip $(DEFAULT_BUNDLE_NAME) ; \
		zip -rm ../$(DEFAULT_BUNDLE_NAME).zip manifest.json static $(DEFAULT_BUNDLE_NAME).zip
	rm -rf ./$(DIST_DIR)/* && mv ./$(DEFAULT_BUNDLE_NAME).zip ./$(DIST_DIR)	

## build: build the app when changed
watch: node_modules
	$(NPM) run dev

run:
	docker-compose up

stop: 
	docker-compose stop

restart: 
	docker-compose stop && docker-compose up

## clean: deletes all
clean:
	$(NPM) run clean

## node_modules: ensures NPM dependencies are installed without having to run this all the time
node_modules: $(wildcard package.json)
	$(NPM) install
	touch $@

help: ## help: prints this help message
	@echo "Usage:"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'