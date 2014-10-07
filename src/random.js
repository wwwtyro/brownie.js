var random = (function() {

    var self = {};

    self.gauss = function() {
        return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
    };

    self.choice = function(a) {
        return a[Math.floor(Math.random() * a.length)];
    };

    return self;

})();