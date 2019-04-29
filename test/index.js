/* eslint-disable no-console */
const assert = require('assert');
const File = require('vinyl');
const plugin = require('../');
const expect = require('chai').expect;

function testStream(stream, fakeFile, expectedResult,done) {
  stream.write(fakeFile);
  const file = stream.read();
  assert(file.isBuffer());
  const result = file.contents.toString();
  assert.equal(result, expectedResult);
  done();
}

describe('append-prepend-dir', () => {
  let fakeFile;
  let fakeFileWithoutCorrespondence;
  beforeEach(()=>{
    fakeFile = new File({
      contents:  new Buffer('text content'),
      base: '/src/',
      path: '/src/dummy.txt',
    });
    fakeFileWithoutCorrespondence = new File({
      contents:  new Buffer('text content'),
      base: '/src/',
      path: '/src/not-exist.txt',
    });
  });

  it('Should append', (done) => {
    // the mix-in stream
    const stream = plugin.append('./testDest');
    const expectedResult = 'text content\n-----';
    testStream(stream, fakeFile, expectedResult, done);
  });

  it('Should append with custom separator', (done) => {
    // the mix-in stream
    const stream = plugin.append('./testDest', {separator:'*'});
    const expectedResult = 'text content*-----';
    testStream(stream, fakeFile, expectedResult, done);
  });

  it('Should prepend', (done) => {
    // the mix-in stream
    const stream = plugin.prepend('./testDest');
    const expectedResult = '-----\ntext content';
    testStream(stream, fakeFile, expectedResult, done);
  });

  it('Should prepend with custom separator', (done) => {
    // the mix-in stream
    const stream = plugin.prepend('./testDest', {separator:new Buffer('*')});
    const expectedResult = '-----*text content';
    testStream(stream, fakeFile, expectedResult, done);
  });

  it('Should prepend with custom separator', (done) => {
    // the mix-in stream
    const stream = plugin.prepend('./testDest', {separator:undefined});
    const expectedResult = '-----text content';
    testStream(stream, fakeFile, expectedResult, done);
  });


  it('Should insert after', (done) => {
    // the mix-in stream
    const stream = plugin.insertAfter('./testDest','text');
    const expectedResult = 'text\n-----\n content';
    testStream(stream, fakeFile, expectedResult, done);
  });

  it('Should insert after with custom separator', (done) => {
    // the mix-in stream
    const stream = plugin.insertAfter('./testDest','text',{separator:'*'});
    const expectedResult = 'text*-----* content';
    testStream(stream, fakeFile, expectedResult, done);
  });

  it('Should insert before with custom separator', (done) => {
    // the mix-in stream
    const stream = plugin.insertBefore('./testDest','cont',{separator:'*'});
    const expectedResult = 'text *-----*content';
    testStream(stream, fakeFile, expectedResult, done);
  });

  it('Should do nothing without corresponding file', (done) => {
    // the mix-in stream
    const stream = plugin.append('./testDest');
    const expectedResult = 'text content';
    testStream(stream, fakeFileWithoutCorrespondence, expectedResult, done);
  });

  it('Should fixed mode works', (done) => {
    // the mix-in stream
    const stream = plugin.insertBefore('./testDest/fixed.txt','cont',{useRelative:false,separator:'*'});
    const expectedResult = 'text *FFFFF*content';
    testStream(stream, fakeFile, expectedResult, done);
  });


  it('Should report error without corresponding file when not ignoring', (done) => {
    // the mix-in stream
    const stream = plugin.append('./testDest', {ignoreMissingFile:false});
    const expectedResult = 'text content';
    expect(()=>{
      testStream(stream, fakeFileWithoutCorrespondence, expectedResult, done);
    }).to.throw();
    done();
  });

  it('Should report error when mark cannot find', (done) => {
    // the mix-in stream
    const stream = plugin.insertAfter('./testDest','NONONO');
    expect(()=>{
      testStream(stream, fakeFile, '', done);
    }).to.throw();
    done();
  });

  it('Should ignore when mark cannot find', (done) => {
    // the mix-in stream
    const stream = plugin.insertAfter('./testDest','NONONO', {ignoreMissingMark:true});
    const expectedResult = 'text content';
    testStream(stream, fakeFile, expectedResult, done);
  });

  it('Should report error when mark cannot find', (done) => {
    // the mix-in stream
    const stream = plugin.insertBefore('./testDest','NONONO');
    expect(()=>{
      testStream(stream, fakeFile, '', done);
    }).to.throw();
    done();
  });

});
