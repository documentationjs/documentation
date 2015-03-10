var test = require('tape'),
    documentation = require('../'),
    path = require('path'),
    fs = require('fs');

test('documentation', function(t) {
    var input = fs.readFileSync(path.join(__dirname, 'fixture/simple.js'));
    t.ok(input);
    t.end();
});
