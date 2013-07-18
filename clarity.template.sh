#!/bin/bash

DOUBLEUNDERSCORE=$(cat)

cat <<EOF
CLARITY.provide('doubleunderscore', [], function(){
return $DOUBLEUNDERSCORE;
});
EOF
