#!/bin/sh

# Exit on error of any of the commands
set -e

cd compliance-by-design-demo
npm audit
npm install
npm run cypress-tests
