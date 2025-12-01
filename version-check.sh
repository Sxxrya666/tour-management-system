#!/bin/bash

echo "I AM IN 'jenkins-testing' branch and coming from github!!"


echo "checking bun's version..."
sleep 1

command="bun -v"
echo 'version is' \'$(eval "$command")\'
echo 'version check done successfully!'