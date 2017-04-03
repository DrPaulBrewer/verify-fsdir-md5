# verify-bucket-md5

[![Build Status](https://travis-ci.org/DrPaulBrewer/verify-fsdir-md5.svg?branch=master)](https://travis-ci.org/DrPaulBrewer/verify-fsdir-md5)

Compare the md5 base64 hash of files in a directory against an md5.json file also stored in the directory.

Absolute paths contained within the md5.json file are ignored.

Returns a Promise resolving to [ true|false,  [goodFileList], [badFileList], {file:err} , md5jsonDirname]

Unless fastfail is true, then throws the first error or md5 mismatch it sees.

`true|false` is overall status

`goodFileList` is an Array of 0 or more files where the md5 listed in md5.json matches the metadata md5 in Google Cloud Storage

`badFileList` is an Array of 0 or more files where the md5 listed in md5.json did not match the metadata md5 in Google Cloud Storage

`{file:err}` contains exceptions reported when trying to access the files listed in md5.json.  For instance, a file might not exist in the bucket.

md5jsonDirname is the "directory" portion of the path of the md5.json file

Files in the badFileList have been modified from the md5 reported in md5.json

Note that files that are not listed in the md5.json file will not be reported in any list and do not invalidate the overall status.

An Error will be thrown if the md5.json file does not exist in the bucket at the specified path.

## Importing and Setup

    const verifyMD5 = require('verify-fsdir-md5');

## Usage

`verifyMD5` returns a `Promise` to the results of the testing

    verifyMD5('/path/to/md5.json', fastfail)   // fastfail is true (throws asap) or false/undefined (returns all results)
    .then(function(status){
	// status[0] is either true or false, reflecting overall md5 test status
	// status[1] is an Array of filenames from md5.json that passed the md5 check
	// status[2] is an Array of filenames from md5.json that failed the md5 check
	// status[3] is an Object whose keys are the filesnames where exceptions were reported in accessing md5 metadata
	//                   and  whose values are the exceptions
	// status[4] is the "directory" portion of the path, e.g. /path/in/the/bucket/to/
	
         if (!status[0]){
             // there was a problem
	     throw new Error("Oh No! There was a problem with file integrity, race conditions, etc.");
	 }
    })
    .then(doYourNextFunction);


## Tests

Mocha tests are included

## Copyright

Copyright 2017 Paul Brewer, Economic and Financial Technology Consulting LLC <drpaulbrewer@eaftc.com>

## License

The MIT License

