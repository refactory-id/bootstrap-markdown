#!/bin/sh

# You can download yuicompressor here https://github.com/yui/yuicompressor/releases/tag/v2.4.8
# Using WGET: $ wget https://github.com/yui/yuicompressor/releases/download/v2.4.8/yuicompressor-2.4.8.jar
#
# Put the JAR file into root of this project!
# Make this script executable
# $ chmod +x minify.sh
# and then run: ./minify.sh

java -jar yuicompressor-2.4.8.jar js/bootstrap-markdown.js > js/bootstrap-markdown.min.js