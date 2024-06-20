#!/bin/bash

# Clone the git repository
git clone https://gist.github.com/53a9867d5169ed043bde845d926c77f4.git mu-plugins/plugin

# Copy all files from mu-plugins/plugin to mu-plugins, excluding .git
rsync -av --progress mu-plugins/plugin/ mu-plugins --exclude .git

# Remove the mu-plugins/git directory
rm -rf mu-plugins/plugin
