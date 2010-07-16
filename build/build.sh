#!/bin/sh

rm -rf built
mkdir built
cat pre.jsfrag ../blade/object.js ../blade/fn.js ../blade/jig.js post.jsfrag > built/blade.js
