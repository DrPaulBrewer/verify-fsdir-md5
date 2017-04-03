/* Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC */
/* This file is open source software.  The MIT License applies to this software. */

/* jshint node:true,mocha:true,esnext:true,eqeqeq:true,undef:true,lastsemic:true */

const fs = require('fs');
const path = require('path');

const readFile = require('fs-readfile-promise');
const hasha = require('hasha');

function MD5FileVerificationError(obj){
    if (obj.actual===obj.expected)
	throw new Error("Bug: actual===expected, but throwing an error?");
    this.name = "MD5FileVerificationError";
    this.message = "md5 File Verification Error on file: "+obj.file+" : expected: "+obj.expected+" actual: "+obj.actual;
    this.stack = (new Error()).stack;
    this.actual = obj.actual;
    this.expected = obj.expected;
    this.file = obj.file;
}

MD5FileVerificationError.prototype = Object.create(Error.prototype);
MD5FileVerificationError.prototype.constructor = MD5FileVerificationError;

function verifyMD5(md5path, fastfail){
    return (readFile(md5path)
	    .then((buffer)=>(buffer.toString('utf8')))
	    .then((jsonstring)=>(JSON.parse(jsonstring)))
	    .then((md5json)=>{
		const err = {};
		const hashopt = {
		    algorithm: 'md5',
		    encoding: 'base64'
		};
		let dir = path.dirname(md5path);
		if (dir.length>0) dir=dir+path.sep;
		const files = Object.keys(md5json).sort().map((f)=>(path.basename(f)));
		const status = [false, [], [], err, dir];
		const promises = (files
				  .map( (f,j)=>{
				      return (hasha
					      .fromFile(dir+f, hashopt)
					      .then( (actual)=>{
						  const expected = md5json[f];
						  if (actual===expected){
						      status[1].push(f);
						      return true;
						  } else {
						      throw new MD5FileVerificationError({expected, actual, file:dir+f});
						  }   
					      })
					      .catch( (e)=>{
						  if (fastfail) throw e;
						  else {
						      err[f]=e;
						      status[2].push(f);
						  }
					      })
					     );
				  })
				 );
		return (Promise.all(promises)
			.then(()=>{
			    status[0]=(status[1].length===files.length);
			    return status;
			})
		       );
	    })
	   );
}

module.exports = verifyMD5;
    
