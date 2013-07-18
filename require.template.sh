#!/bin/bash

DOUBLEUNDERSCORE=$(cat)

cat <<EOF
define(function(){
return $DOUBLEUNDERSCORE;
});
EOF
