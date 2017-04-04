/* Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* jshint node:true,esnext:true,eqeqeq:true,undef:true,lastsemic:true */

const verifyFactory = require('verify-common-md5');
const fs = require('fs');
const readFile = require('fs-readfile-promise');
const hasha = require('hasha');

const hashopt = {
    algorithm: 'md5',
    encoding: 'base64'
};

function blueprint(fastFail){
    return {
	promiseChecklistBuffer: readFile,
	promiseActual: (dir, fname)=>(hasha.fromFile(dir+fname, hashopt)),
	getPrefix: (filepath)=>(/^.*\//.exec(filepath)[0]),
	fastFail
    };
}


module.exports = function verifyMD5(md5path, fastFail){
    const _verify = verifyFactory(blueprint(fastFail));
    return _verify(md5path);
}

    
