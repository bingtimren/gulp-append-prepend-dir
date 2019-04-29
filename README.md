# gulp-append-prepend-dir

> Append or prepend the file content with the corresponding file in a dir

[![Build Status](https://travis-ci.org/bingtimren/gulp-append-prepend-dir.svg?branch=master)](https://travis-ci.org/bingtimren/gulp-append-prepend-dir)
[![Coverage Status](https://coveralls.io/repos/github/bingtimren/gulp-append-prepend-dir/badge.svg?branch=master)](https://coveralls.io/github/bingtimren/gulp-append-prepend-dir?branch=master)
[![Dependency Status](https://david-dm.org/bingtimren/gulp-append-prepend-dir.svg)](https://david-dm.org/bingtimren/gulp-append-prepend-dir)
[![devDependency Status](https://david-dm.org/bingtimren/gulp-append-prepend-dir/dev-status.svg)](https://david-dm.org/bingtimren/gulp-append-prepend-dir#info=devDependencies)
[![npm](https://img.shields.io/npm/v/gulp-append-prepend-dir.svg)](https://www.npmjs.com/package/gulp-append-prepend-dir)
[![npm](https://img.shields.io/npm/dt/gulp-append-prepend-dir.svg)](https://www.npmjs.com/package/gulp-append-prepend-dir)

## Install

```
$ npm install gulp-append-prepend-dir --save-dev
```

## Usage

Like 'gulp-append-prepend', this plugin loads content of a file from the file system and append, prepend, or insert the loaded content into the streamed files (pipe). However, this plugin works in 'relative' mode by default, loads the content from not a fixed file (like gulp-append-prepend), but a file with the same relative path of the streamed file from a given base dir. For example, if the current streamed file is sourced from 'src/*.txt', whereas the 'relative' property (see gulp Vinyl API) is 'a.txt', then when the base dir is given 'dest/', the plugin loads contents to be appended/prepended/inserted from 'dest/a.txt'. 

This plugin can be used with slush to append various contents from a template dir to the existing files in the working dir, whereas the to be appended contents are in the template dir with the same relative path and file name with the corresponding files in the working dir.

```js
const gulp = require('gulp');
const gapd = require('gulp-append-prepend-dir');

gulp.task('myTask', () => {
  gulp.src(['srcDir/**.txt'])
    .pipe(gapd.append('./destDir'))
    .pipe(gulp.dest('destDir'));
});
```

All functions accept an optional object parameter as options. Defaults are:

```js
{
  ignoreMissingFile: true,
  separator:'\n',
  useRelative:true,
  ignoreMissingMark: false
}
```
ignoreMissingFile: default true, if the file from which content is to be appended/prepended/inserted cannot be found, simply ignore and does not throw an error.

separator: default new line

useRelative: default true, use 'relative' mode, where the given dir is used as the base dir and full path of the file to load is calculated from the base dir and the 'relative' property of the streamed file. If useRelative is specified false, use the given dir as full path to a file and append/prepend/insert the content of this file to all streamed files.

ignoreMissingMark: when the content is to be inserted before or after a mark and when the mark is missing, ignore and does not throw an error. Default false.

The exported functions are:
```js
append(dir:string, opt:options={})
prepend(dir:string, opt:options={})
``` 
Return a node stream Transform that append contents read from file in dir (or file specified by dir, depending on relative mode).

```js
insertAfter(dir:string, mark:string, opt:options={})
insertBefore(dir:string, mark:string, opt:options={})
```
Return a node stream Transform that insert the contents read from file in (or specified by) dir after/before the mark string in the streamed content. 

Also check the unit test for example usages.

## Development

### Tests

*Run the unit tests with [mocha](https://mochajs.org/):*
```sh
$ npm run test
```

*Calculate the coverage with [Istanbul](https://gotwarlost.github.io/istanbul/):*
```sh
$ npm run cover
```

## Versioning
To keep better organization of releases we follow the [Semantic Versioning 2.0.0](http://semver.org/) guidelines.

## Contributing
Find on our [issues](https://github.com/bingtimren/gulp-append-prepend-dir/issues/) the next steps of the project ;)
<br>
Want to contribute? [Follow these recommendations](https://github.com/bingtimren/gulp-append-prepend-dir/blob/master/CONTRIBUTING.md).

## History
See [Releases](https://github.com/bingtimren/gulp-append-prepend-dir/releases) for detailed changelog.

## License
[MIT License](https://github.com/bingtimren/gulp-append-prepend-dir/blob/master/LICENSE.md) © bingtimren
