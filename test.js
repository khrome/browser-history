var should = require("should");
require('./history');

describe('browser-history', function(){
    describe('object, function(){
        it('creates a new stack item');
        it('can move forward N, then move back M and stack maintains correct size');
        it('can replace an item and stack maintains correct size');
        it('can move forward if no action is taken');
        it('cannot move forward if another action is taken');
        it('generates popstates');
    });
});