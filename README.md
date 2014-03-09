# bitesize

A JavaScript blog library that processes YAML Front-Matter markdown files and creates blog data structures:

* Post: A class that converts markdown with YAML front-matter into an object with properties representing the major pieces

* Blog: A class that holds an array of posts

Includes a helper class:

* GH: A class for pulling files out of a GitHub repository

## More details

Documents are formatted in the [Jekyll Front-Matter Markdown Format](http://jekyllrb.com/docs/frontmatter/)

API returns ES6 JavaScript promises.

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
