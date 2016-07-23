const Module = require("../../source/index.js");

const Config = Module.Config;

module.exports = {

    setUp: function(cb) {
        this.basicConfig = new Config({});
        this.previousConfig = new Config({
            collection: [1, 2]
        });
        cb();
    },

    tearDown: function(cb) {
        cb();
    },

    push: {

        createsNewArray: function(test) {
            this.basicConfig
                .push("my.collection", "a")
                .push("my.collection", "b")
                .push("my.collection", "c");
            test.strictEqual(this.basicConfig._config.my.collection.join(","), "a,b,c", "All values should be pushed");
            test.done();
        },

        pushesToExisting: function(test) {
            this.previousConfig.push("collection", 0);
            test.strictEqual(this.previousConfig._config.collection.join(","), "1,2,0", "All values should be pushed");
            test.done();
        }

    },

    write: {

        setsValue: function(test) {
            this.basicConfig.write("my.nested.value", 123);
            test.strictEqual(this.basicConfig._config.my.nested.value, 123, "Set value should be correct");
            test.done();
        }

    }
};
