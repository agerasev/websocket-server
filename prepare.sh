#!/bin/bash

# fetch submodules
git submodule init
git submodule update

# install server deps
npm install

# install apps deps
cd ./apps
for i in *; do
	cd $i
	npm install
	cd ..
done
cd ..
