function QueueBug() {
    // Because https://code.google.com/p/chromium/issues/detail?id=393569
    var self = this;
    self.initialize = function() {
        self.index = 0;
        self.queue = [];
        self.chunkSize = 1000;
    }
    self.push = function(item) {
        self.queue.push(item);
    }
    self.pushMultiple = function(items) {
        self.queue.push.apply(self.queue, items);
    }
    self.shift = function() {
        var item = undefined;
        if (self.index < self.queue.length) {
            item = self.queue[self.index];
        }
        self.index++;
        if (self.index >= self.chunkSize || self.index >= self.queue.length) {
            self.queue = self.queue.slice(self.index, self.queue.length);
            self.index = 0;
        }
        return item;
    }
    self.length = function() {
        return self.queue.length;
    }
    self.initialize();
}
