var should = require('chai').should()

var number = 20;
var items = [1,2,3,4,5];

describe('#index', function () {
    it('> number', function () {
        number.should.be.a('number');
    })

    it('> number par', function () {
        var result = number % 2;
        result.should.equal(0);

    })
})


describe('#HaveItems', function () {
    it('> There are 5 items', function () {
       var count = 0;

       for (var i = items.length - 1; i >= 0; i--) {
            var item = items[i]
            count++;
        }
        
        count.should.equal(5);
    })
})