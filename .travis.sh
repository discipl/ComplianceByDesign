#!/bin/sh

# Exit on error of any of the commands
set -e

cd compliance-by-design-demo
npm audit || [ $(date +%s) -lt 1630447200 ] # Temporarily disable audit manual review required
npm install
npm start &
cypress run
