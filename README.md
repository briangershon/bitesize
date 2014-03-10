# bitesize

A simple blog library based on YAML Front-Matter Markdown documents.

Expects [yfm](https://github.com/assemble/yfm) encoded markdown documents.

Includes:

* Post: A class that manages individual blog posts.

* Blog: A class that holds an array of posts.


## Status of build

[![Build Status](https://travis-ci.org/briangershon/bitesize.png?branch=master)](https://travis-ci.org/briangershon/bitesize)

## Installation

        npm install bitesize

## Usage / Sample Application

Create system environmental variables:

        export BITESIZE_GITHUB_ACCESS_TOKEN='token-goes-here'       # create token at github.com
        export BITESIZE_BLOG_GITHUB_REPO='briangershon/hexo-blog'   # the username and repository
        export BITESIZE_BLOG_GITHUB_POST_PATH='source/_posts'       # a path within that repository

Run `npm start` to run index.js which shows all files in that repository/path

## Running unit tests

        npm test
