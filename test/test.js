var path = require('path');
var expect = require('expect.js');
var _s = require('underscore.string');
var bowerJson = require('../lib/json');
var request = require('request');

describe('.find', function () {
  it('should find the ano.json file', function (done) {
    bowerJson.find(__dirname + '/pkg-ano-json', function (err, file) {
      if (err) {
        return done(err);
      }

      expect(file).to.equal(path.resolve(__dirname + '/pkg-ano-json/ano.json'));
      done();
    });
  });

  it('should fallback to the library.json file', function (done) {
    bowerJson.find(__dirname + '/pkg-library-json', function (err, file) {
      if (err) {
        return done(err);
      }

      expect(file).to.equal(path.resolve(__dirname + '/pkg-library-json/library.json'));
      done();
    });
  });


  it('should fallback to the .ano.json file', function (done) {
    bowerJson.find(__dirname + '/pkg-dot-ano-json', function (err, file) {
      if (err) {
        return done(err);
      }

      expect(file).to.equal(path.resolve(__dirname + '/pkg-dot-ano-json/.ano.json'));
      done();
    });
  });

  it('should fallback to the library.properties file', function (done) {
    bowerJson.find(__dirname + '/pkg-library-properties', function (err, file) {
      if (err) {
        return done(err);
      }

      expect(file).to.equal(path.resolve(__dirname + '/pkg-library-properties/library.properties'));
      done();
    });
  });

  it('should error if no ano.json / .ano.json / library.json / library.properties is found', function (done) {
    bowerJson.find(__dirname, function (err) {
      expect(err).to.be.an(Error);
      expect(err.code).to.equal('ENOENT');
      expect(err.message).to.equal('None of ano.json, .ano.json, library.json, library.properties were found in ' + __dirname);
      done();
    });
  });
});

describe('.findSync', function () {

  it('should find the ano.json file', function (done) {
    var file = bowerJson.findSync(__dirname + '/pkg-ano-json');

    expect(file).to.equal(path.resolve(__dirname + '/pkg-ano-json/ano.json'));
    done();
  });

  it('should fallback to the library.json file', function (done) {
    var file = bowerJson.findSync(__dirname + '/pkg-library-json');

    expect(file).to.equal(path.resolve(__dirname + '/pkg-library-json/library.json'));
    done();
  });

  it('should fallback to the .ano.json file', function (done) {
    var file = bowerJson.findSync(__dirname + '/pkg-dot-ano-json');

    expect(file).to.equal(path.resolve(__dirname + '/pkg-dot-ano-json/.ano.json'));
    done();
  });

  it('should error if no library.json / ano.json / .ano.json is found', function (done) {
    var err = bowerJson.findSync(__dirname);
    expect(err).to.be.an(Error);
    expect(err.code).to.equal('ENOENT');
    expect(err.message).to.equal('None of ano.json, .ano.json, library.json, library.properties were found in ' + __dirname);
    done();
  });


});

describe('.read', function () {
  it('should give error if file does not exists', function (done) {
    bowerJson.read(__dirname + '/willneverexist', function (err) {
      expect(err).to.be.an(Error);
      expect(err.code).to.equal('ENOENT');
      done();
    });
  });

  it('should give error if when reading an invalid json', function (done) {
    bowerJson.read(__dirname + '/pkg-ano-json-malformed/ano.json', function (err) {
      expect(err).to.be.an(Error);
      expect(err.code).to.equal('EMALFORMED');
      expect(err.file).to.equal(path.resolve(__dirname + '/pkg-ano-json-malformed/ano.json'));
      done();
    });
  });

  it('should read the file and give an object', function (done) {
    bowerJson.read(__dirname + '/pkg-ano-json/ano.json', function (err, json) {
      if (err) {
        return done(err);
      }

      expect(json).to.be.an('object');
      expect(json.name).to.equal('SomeLibrary');
      expect(json.version).to.equal('0.0.0');

      done();
    });
  });

  it('should give the json file that was read', function (done) {
    bowerJson.read(__dirname + '/pkg-ano-json', function (err, json, file) {
      if (err) {
        return done(err);
      }


      expect(file).to.equal(__dirname + '/pkg-ano-json/ano.json');
      done();
    });
  });

  it('should find for a json file if a directory is given', function (done) {
    bowerJson.read(__dirname + '/pkg-library-json', function (err, json, file) {
      if (err) {
        return done(err);
      }

      expect(json).to.be.an('object');
      expect(json.name).to.equal('SomeLibrary');
      expect(json.version).to.equal('0.0.0');
      expect(file).to.equal(path.resolve(__dirname + '/pkg-library-json/library.json'));
      done();
    });
  });

  it('should validate the returned object unless validate is false', function (done) {
    bowerJson.read(__dirname + '/pkg-ano-json-invalid/ano.json', function (err) {
      expect(err).to.be.an(Error);
      expect(err.message).to.contain('name');
      expect(err.file).to.equal(path.resolve(__dirname + '/pkg-ano-json-invalid/ano.json'));

      bowerJson.read(__dirname + '/pkg-ano-json-invalid/ano.json', {validate: false}, function (err) {
        done(err);
      });
    });
  });

  it('should normalize the returned object by default', function (done) {
    bowerJson.read(__dirname + '/pkg-ano-json-2/ano.json', function (err, json) {
      if (err) {
        return done(err);
      }

      expect(json.name).to.equal('Some_Library');

      bowerJson.read(__dirname + '/pkg-ano-json-2/ano.json', {normalize: false}, function (err, json) {
        if (err) {
          return done(err);
        }

        expect(json.name).to.eql('Some Library');
        done();
      });
    });
  });

  it('should find for a properties file if a directory is given', function (done) {
    bowerJson.read(__dirname + '/pkg-library-properties', function (err, json, file) {
      if (err) {
        return done(err);
      }

      expect(json).to.be.an('object');
      expect(json.name).to.equal('SomeLibrary');
      expect(json.version).to.equal('0.0.0');
      expect(file).to.equal(path.resolve(__dirname + '/pkg-library-properties/library.properties'));
      done();
    });
  });

  it('should give error if no .json files in strict mode', function (done) {
    bowerJson.read(__dirname + '/pkg-library-properties', {strict: true}, function (err) {
      expect(err).to.be.an(Error);
      expect(err.code).to.equal('ENOENT');
      done();
    });
  });
});

describe('.readSync', function () {
  it('should give error if file does not exists', function (done) {
    var err = bowerJson.readSync(__dirname + '/willneverexist');
    expect(err).to.be.an(Error);
    expect(err.code).to.equal('ENOENT');
    done();
  });

  it('should give error if when reading an invalid json', function (done) {
    var err = bowerJson.readSync(__dirname + '/pkg-ano-json-malformed/ano.json');
    expect(err).to.be.an(Error);
    expect(err.code).to.equal('EMALFORMED');
    expect(err.file).to.equal(path.resolve(__dirname + '/pkg-ano-json-malformed/ano.json'));
    done();
  });

  it('should read the file and give an object', function (done) {
    var json = bowerJson.readSync(__dirname + '/pkg-ano-json/ano.json');

    expect(json).to.be.an('object');
    expect(json.name).to.equal('SomeLibrary');
    expect(json.version).to.equal('0.0.0');

    done();
  });

  it('should find for a json file if a directory is given', function (done) {
    var json = bowerJson.readSync(__dirname + '/pkg-library-json');

    expect(json).to.be.an('object');
    expect(json.name).to.equal('SomeLibrary');
    expect(json.version).to.equal('0.0.0');
    done();
  });

  it('should validate the returned object unless validate is false', function (done) {
    var err = bowerJson.readSync(__dirname + '/pkg-ano-json-invalid/ano.json');
    expect(err).to.be.an(Error);
    expect(err.message).to.contain('name');
    expect(err.file).to.equal(path.resolve(__dirname + '/pkg-ano-json-invalid/ano.json'));

    err = bowerJson.readSync(__dirname + '/pkg-ano-json-invalid/ano.json', {validate: false});
    expect(err).to.not.be.an(Error);
    done();
  });

  it('should not normalize the returned object if normalize is false', function (done) {
    var json = bowerJson.readSync(__dirname + '/pkg-ano-json-2/ano.json');
    expect(json.name).to.equal('Some_Library');

    json = bowerJson.readSync(__dirname + '/pkg-ano-json-2/ano.json', {normalize: false});

    expect(json.name).to.eql('Some Library');
    done();
  });


  it('should find for a properties file if a directory is given', function (done) {
    var json = bowerJson.readSync(__dirname + '/pkg-library-properties');

    expect(json).to.be.an('object');
    expect(json.name).to.equal('SomeLibrary');
    expect(json.version).to.equal('0.0.0');
    done();
  });


  it('should give error if no .json files in strict mode', function (done) {
    var err = bowerJson.readSync(__dirname + '/pkg-library-properties', {strict: true});
    expect(err).to.be.an(Error);
    expect(err.code).to.equal('ENOENT');
    expect(err.file).to.undefined;
    done();
  });

});

describe('.parse', function () {
  it('should return the same object, unless clone is true', function () {
    var json = {name: 'foo'};

    expect(bowerJson.parse(json)).to.equal(json);
    expect(bowerJson.parse(json, {clone: true})).to.not.equal(json);
    expect(bowerJson.parse(json, {clone: true})).to.eql(json);
  });

  it('should validate the passed object, unless validate is false', function () {
    expect(function () {
      bowerJson.parse({});
    }).to.throwException(/name/);

    expect(function () {
      bowerJson.parse({}, {validate: false});
    }).to.not.throwException();
  });

  it('should not normalize the passed object if normalize is false', function () {
    var json = {name: 'foo bar', main: 'foo.js'};

    bowerJson.parse(json, {normalize: false});
    expect(json.name).to.eql('foo bar');

    bowerJson.parse(json);
    expect(json.name).to.eql('foo_bar');

  });
});

describe('.getIssues', function () {
  it('should print no errors even for weird package names', function () {
    var json = {name: '@gruNt/my dependency'};

    expect(bowerJson.getIssues(json).errors).to.be.empty();
  });

  it('should validate the name length', function () {
    var json = {name: 'a_123456789_123456789_123456789_123456789_123456789_z'};

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "name" is too long, the limit is 50 characters'
    );
  });

  it('should validate the name starts with lowercase', function () {
    var json = {name: '-runt'};

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "name" cannot start with dot or dash'
    );
  });

  it('should validate the name starts with lowercase', function () {
    var json = {name: '.grunt'};

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "name" cannot start with dot or dash'
    );
  });

  it('should validate the name ends with lowercase', function () {
    var json = {name: 'grun-'};

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "name" cannot end with dot or dash'
    );
  });

  it('should validate the name ends with lowercase', function () {
    var json = {name: 'grun.'};

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "name" cannot end with dot or dash'
    );
  });

  it('should validate the name is valid', function () {
    var json = {name: 'gru.n-t'};

    expect(bowerJson.getIssues(json).warnings).to.eql([]);
  });

  it('should validate the description length', function () {
    var json = {
      name: 'foo',
      description: _s.repeat('æ', 141)
    };

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "description" is too long, the limit is 140 characters'
    );
  });

  it('should validate the description is valid', function () {
    var json = {
      name: 'foo',
      description: _s.repeat('æ', 140)
    };

    expect(bowerJson.getIssues(json).warnings).to.eql([]);
  });

  it('should validate that main does not contain globs', function () {
    var json = {
      name: 'foo',
      main: ['js/*.js']
    };

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "main" field cannot contain globs (example: "*.js")'
    );
  });

  it('should validate that main does not contain minified files', function () {
    var json = {
      name: 'foo',
      main: ['foo.min.css']
    };

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "main" field cannot contain minified files'
    );
  });

  it('should validate that main does not contain fonts', function () {
    var json = {
      name: 'foo',
      main: ['foo.woff']
    };

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "main" field cannot contain font, image, audio, or video files'
    );
  });

  it('should validate that main does not contain images', function () {
    var json = {
      name: 'foo',
      main: ['foo.png']
    };

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "main" field cannot contain font, image, audio, or video files'
    );
  });

  it('should validate that main does not contain multiple files of the same filetype', function () {
    var json = {
      name: 'foo',
      main: ['foo.js', 'bar.js']
    };

    expect(bowerJson.getIssues(json).warnings).to.contain(
      'The "main" field has to contain only 1 file per filetype; found multiple .js files: ["foo.js","bar.js"]'
    );
  });
});

describe('.validate', function () {
  it('should validate the name property', function () {
    expect(function () {
      bowerJson.validate({});
    }).to.throwException(/name/);
  });

  it('should validate the type of main', function () {
    var json = {
      name: 'foo',
      main: {}
    };
    expect(function () {
      bowerJson.validate(json);
    }).to.throwException();
  });
  it('should validate the type of items of an Array main', function () {
    var json = {
      name: 'foo',
      main: [{}]
    };
    expect(function () {
      bowerJson.validate(json);
    }).to.throwException();
  });
});

describe('.normalize', function () {
  it('should normalize the main property', function () {
    var json = {name: 'foo bar', main: 'foo.js'};

    bowerJson.normalize(json);
    expect(json.name).to.eql('foo_bar');
  });
});

describe.skip('packages from ano registry', function () {

  var packageList,
    packageListUrl = 'http://ano.herokuapp.com/packages';

  this.timeout(60000);

  it('can be downloaded from online source ' + packageListUrl, function (done) {
    request({
      url: packageListUrl,
      json: true
    }, function (error, response, body) {

      if (error) {
        throw error;
      }

      expect(body).to.be.an('array');
      expect(body).to.not.be.empty();
      packageList = body;

      done();

    });
  });

  it('should validate each listed package', function (done) {

    expect(packageList).to.be.an('array');

    var invalidPackageCount = 0;

    packageList.forEach(function (package) {
      try {
        bowerJson.validate(package);
      } catch (e) {
        invalidPackageCount++;
        console.error('validation of "' + package.name + '" failed: ' + e.message);
      }

    });

    if (invalidPackageCount) {
      throw new Error(invalidPackageCount + '/' + packageList.length + ' package names do not validate');
    }

    done();

  });
});

