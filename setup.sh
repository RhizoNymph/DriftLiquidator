#!/bin/bash

sudo apt update
sudo apt upgrade
sudo apt install -y nodejs npm curl
sudo npm install -g npm@latest
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm install 17.0.1
nvm use 17.0.1
npm install -g typescript --save-dev
npm install @types/node @types/async --save-dev
npm install tslib async @drift-labs/sdk @solana/spl-token @solana/web3.js @project-serum/anchor ts-node
echo -e "const { TextEncoder, TextDecoder } = require(\"util\");\n$(cat node_modules/@solana/web3.js/src/keypair.ts)" > node_modules/@solana/web3.js/src/keypair.ts
tsc --init
sudo snap install go --classic
GOPATH=`pwd` go get github.com/mrkschan/cuttle
