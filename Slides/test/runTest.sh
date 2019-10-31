#!/bin/bash

echo "Running mocha tests for $# files."

for i in "$@"
do
    echo "Running the Mocha Test for $@"
    ../node_modules/.bin/mocha --reporter nyan $i
done
