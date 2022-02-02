#!/bin/bash
bin/cuttle &
sudo npm link typescript
#proxychains npx ts-node src/liquidator.ts
npx ts-node src/liquidator.ts
