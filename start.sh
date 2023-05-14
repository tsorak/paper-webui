#!/bin/sh
[ ! -d "mc" ] && mkdir mc

echo "eula=true" > ./mc/eula.txt

# clean latest log
[ -f "latest.log" ] && rm latest.log

# run

deno run -A main.ts