/* Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* jshint node:true,mocha:true,esnext:true,eqeqeq:true,undef:true,lastsemic:true */

const assert = require('assert');
require('should');

const fs = require('fs');
const md5Base64 = require('md5-base64');

const verifyMD5 = require('../index.js');

const mkdirp = require('mkdirp');

function fname(path){
    return path.replace(/.*\//,'');
}

const dir = "/tmp/testing-verify-fsdir-md5/";

function assertFileExists(f, expected){
    assert.equal(fs.existsSync(dir+f), expected);
}

const file1 = 'hello.txt';
const file2 = 'date.json';
const file3 = 'code.js';
const md5file = 'md5.json';

const md5path = dir+md5file;

const files = [file3,file2,file1]; // sort order

function filesExist(expected){
    files.forEach( (f)=>(assertFileExists(f,expected)) );
}


function suite(){
    return function(){
	it('no files exist', function(){
	    return filesExist(false);
	});
	it('verifyMD5("/bad/path/to/nonexistent/file") throws error', function(done){
	    verifyMD5('/bad/path/to/nonexistent/file').then(()=>(done("test failed")),
									  (e)=>(done()));
	});
	it('create the files for testing', function(){
	    mkdirp.sync(dir);
	    const contents  = [
		fs.readFileSync("./index.js"),
		"The time is "+new Date().toString(),
		"Hello World "+Math.random()
	    ];
	    files.forEach( (f,j)=>(fs.writeFileSync(dir+f, contents[j])) );
	    const md5s = contents.map(md5Base64);
	    const md5json = {};
	    contents.forEach( (s,j)=>{ md5json[files[j]]=md5s[j]; } );
	    fs.writeFileSync(md5path, JSON.stringify(md5json,null,2));
	});
	it('all of the files exist', function(){
	    return filesExist(true);
	});
	it('verifyMD5 resolves to [true, [files], [empty], {empty}, dir to md5.json]', function(){
	    return (verifyMD5(md5path)
		    .then(function(status){
			status.should.deepEqual([true, files, [], {}, dir]);
		    })
		   );
	});
	it('delete the file: code.js', function(){
	    fs.unlinkSync(dir+file3);
	    assertFileExists(file3,false);
	});
	it('verifyMD5 resolves to [false, [file1,file2], [file3], {file3: someError}, dir to md5.json]', function(){
	    return (verifyMD5(md5path)
		    .then(function(status){
			assert.equal(status.length,5);
			assert.equal(status[0], false);
			status[1].should.deepEqual([file2,file1]);
			status[2].should.deepEqual([file3]);
			assert.ok(typeof(status[3][file1])==='undefined');
			assert.ok(typeof(status[3][file2])==='undefined');
			assert.ok(typeof(status[3][file3])!=='undefined');
			assert.equal(status[4],dir);
		    })
		   );
	});
	it('replace contents of file 2 without updating md5.json file ', function(){
	    return fs.writeFileSync(dir+file2, "yabba dabba d"+Math.random());
	});
	it('verifyMD5 resolves to [false, [file1], [file3,file2], {file2: md5Error, file3: someError}, dir to md5.json]', function(){
	    return (verifyMD5(md5path)
		    .then(function(status){
			assert.equal(status.length,5);
			assert.equal(status[0], false);
			status[1].should.deepEqual([file1]);
			status[2].should.deepEqual([file3,file2]);
			assert.ok(typeof(status[3][file1])==='undefined');
			assert.ok(typeof(status[3][file2])!=='undefined');
			assert.ok((status[3][file2].name==="MD5FileVerificationError"));			  
			assert.ok(typeof(status[3][file3])!=='undefined');
		    })
		   );
	});
	it('delete files', function(){
	    files.forEach( (f)=>{ try { fs.unlinkSync(dir+f);} catch(e){} });
	});
	it('no files exist', function(){
	    return filesExist(false);
	});
    };
}

describe('verify-fsdir-md5:', suite());
