var test = require('tape'),
    documentation = require('../'),
    path = require('path'),
    concat = require('concat-stream');

test('documentation', function(t) {
    documentation(path.join(__dirname, 'fixture/simple.js')).pipe(concat(function(data) {
        console.log(data);
        t.equal(data.length, 1, 'simple has no dependencies');
        t.end();
    }));
});
