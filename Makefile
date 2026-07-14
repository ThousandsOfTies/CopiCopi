# CopiCopi project Makefile
# Dependencies are pinned as Git submodules in .gitmodules.

.PHONY: help setup init update install build-repos build clean status test dev

REPOS_DIR := repos
DRAWING_COMMON := $(REPOS_DIR)/drawing-common
HOME_TEACHER_COMMON := $(REPOS_DIR)/home-teacher-common
COPICOPI_APP := $(REPOS_DIR)/copicopi-app
SUBMODULES := $(DRAWING_COMMON) $(HOME_TEACHER_COMMON) $(COPICOPI_APP)

.DEFAULT_GOAL := help

## help: Show available commands
help:
	@echo "CopiCopi project"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/^## /  make /'

## setup: Initialize submodules, install dependencies, and build
setup: init install build-repos

## init: Initialize the submodules pinned by this repository
init:
	@git submodule update --init --recursive

## update: Move submodules to their configured remote branches; commit the resulting gitlinks
update:
	@git submodule update --remote --recursive

## install: Install dependencies in every submodule
install: init
	@cd $(DRAWING_COMMON) && npm install
	@cd $(HOME_TEACHER_COMMON) && npm install
	@cd $(COPICOPI_APP) && npm install

## build-repos: Build shared libraries
build-repos: init
	@cd $(DRAWING_COMMON) && npm run build

## build: Build shared libraries and the CopiCopi application
build: build-repos
	@cd $(COPICOPI_APP) && npm run build

## dev: Start the CopiCopi Vite development server
dev: init
	@cd $(COPICOPI_APP) && npm run dev

## clean: Remove generated build output while keeping submodules
clean:
	@rm -rf $(DRAWING_COMMON)/dist $(HOME_TEACHER_COMMON)/dist $(COPICOPI_APP)/dist deploy

## status: Show parent and submodule Git status
status:
	@git status -sb
	@git submodule status
	@for repo in $(SUBMODULES); do echo ""; echo "$$repo:"; git -C $$repo status -sb; done

## test: Run test scripts where provided
test: init
	@for repo in $(SUBMODULES); do if npm -s --prefix $$repo run | grep -q 'test'; then npm --prefix $$repo test; fi; done
