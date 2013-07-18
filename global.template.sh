#!/bin/bash

DOUBLEUNDERSCORE=$(cat)

cat <<EOF
var __ = $DOUBLEUNDERSCORE;
EOF
