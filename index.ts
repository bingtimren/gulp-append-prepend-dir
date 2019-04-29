'use strict';

import * as through from 'through2'
import * as path from 'path'
import * as Vinyl from 'vinyl'
import * as fs from 'fs'

interface options {
  ignoreMissingFile?: boolean,
  separator?: string|Buffer,
  useRelative?: boolean,
  ignoreMissingMark?: boolean
}

type MixFunction = (file:Vinyl,readInContent:Buffer,separator:Buffer, options:options, cb:through.TransformCallback) => void 

const defaultOptions:options = {
  ignoreMissingFile: true,
  separator:'\n',
  useRelative:true,
  ignoreMissingMark: false
}

let appendMixIn:MixFunction = function( file: Vinyl, readInContent:Buffer,separator:Buffer) {
  file.contents = Buffer.concat([file.contents as Buffer, separator,readInContent])
}

let prependMixIn:MixFunction = function( file: Vinyl, readInContent:Buffer,separator:Buffer) {
  file.contents = Buffer.concat([readInContent, separator, file.contents as Buffer])
}

/**
 * @param mark the string mark to find
 * @param fConcat the specific function to insert readInContent into contents before/after marked position
 */
function getSearchInsertFunc(mark:string|Buffer, fConcat:(contents:Buffer,index:number,markBuffer:Buffer,separator:Buffer, readInContent:Buffer)=>Buffer) {
  let markBuffer = asBuffer(mark)
  return function( file: Vinyl, readInContent:Buffer,separator:Buffer,opt:options,cb:through.TransformCallback){
    let contents = file.contents as Buffer
    let index = contents.indexOf(markBuffer)
    if (index >= 0) { // found that mark, do the concat
      file.contents = fConcat(contents, index, markBuffer, separator, readInContent)
    } else if (!opt.ignoreMissingMark) {     // mark missing
      cb('Unable to find insert mark in file '+file.path)
    } // else ignore and do nothing
  }
}

function fInsertAfter(contents:Buffer,index:number,markBuffer:Buffer,separator:Buffer, readInContent:Buffer):Buffer {
  return Buffer.concat(
    [ contents.slice(0,index+markBuffer.length),
      separator,
      readInContent,
      separator,
      contents.slice(index+markBuffer.length)
    ])  
}

function getInsertAfterMixIn(mark:string|Buffer): MixFunction{
  return getSearchInsertFunc(mark, fInsertAfter)
} 

function fInsertBefore(contents:Buffer,index:number,markBuffer:Buffer,separator:Buffer, readInContent:Buffer):Buffer {
  return Buffer.concat(
    [ contents.slice(0,index),
      separator,
      readInContent,
      separator,
      contents.slice(index)
    ])
}


function getInsertBeforeMixIn(mark:string|Buffer): MixFunction{
  return getSearchInsertFunc(mark, fInsertBefore)
} 



export function append(dir:string, opt:options={}){
  return getTransform(dir,appendMixIn,opt)
}

export function prepend(dir:string, opt:options={}){
  return getTransform(dir,prependMixIn,opt)
}

export function insertAfter(dir:string, mark:string, opt:options={}){
  return getTransform(dir,getInsertAfterMixIn(mark),opt)
}

export function insertBefore(dir:string, mark:string, opt:options={}){
  return getTransform(dir,getInsertBeforeMixIn(mark),opt)
}

function asBuffer(stringOrBuffer:string|Buffer|undefined):Buffer{
  // prepare the separator
  if (stringOrBuffer) {
    if (typeof stringOrBuffer === 'string') {
      return new Buffer(stringOrBuffer, 'utf-8')
    } else {
      return stringOrBuffer
    }
  } else {
    return new Buffer(0)
  }
}

/**
 * 
 * @param dir - the directory to find corresdponging file
 * @param mix - function for mixing the Vinyl file and the Buffer being read from the corresponding file
 */
function getTransform (dir:string,mix:MixFunction,options:options) {
  let opt = Object.assign({},defaultOptions,options)
  let separator = asBuffer(opt.separator)
  let fixedBuffer = opt.useRelative?null:fs.readFileSync(dir)
  return through.obj((file:Vinyl, _, cb) => {
    if (file.isNull()) {
      return cb(null, file);
    }
    if (file.isStream()) {
      return cb('Streams not supported!');
    }
    if (file.isBuffer()) {
      if (opt.useRelative) {
        let relativePath = path.join(dir, file.relative)
        if (fs.existsSync(relativePath)) {
          mix(file,fs.readFileSync(relativePath),separator,opt,cb);
        } else {
          if (!opt.ignoreMissingFile) {
            return cb('Cannot find file '+relativePath)
          } // else nothing to do
        } 
      } else {
        mix(file,fixedBuffer as Buffer,separator,opt,cb);
      }
      cb(null, file);
    }
  });

};
