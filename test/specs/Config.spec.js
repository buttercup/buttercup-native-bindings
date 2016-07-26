const fs = require("fs");
const rimraf = require("rimraf");

const Module = require("../../source/index.js");

const Config = Module.Config;

module.exports = {

    setUp: function(cb) {
        this.basicConfig = new Config({});
        this.previousConfig = new Config({
            collection: [1, 2],
            sub: {
                value: null
            }
        });
        this.defaultConfiguration = {
            configFilename: ".test.config",
            configLocation: {
                macos: ".",
                linux: "."
            }
        };
        this.defaultConfigPath = Config.getPathForConfig(this.defaultConfiguration);
        rimraf.sync(this.defaultConfigPath);
        cb();
    },

    tearDown: function(cb) {
        rimraf.sync(this.defaultConfigPath);
        cb();
    },

    get: {

        getsValues: function(test) {
            let val = this.previousConfig.get("sub.value", true);
            test.strictEqual(val, null, "Correct value should be returned");
            test.done();
        },

        getsArrayValues: function(test) {
            let val = this.previousConfig.get("collection");
            test.ok(val.indexOf(1) === 0, "Contains correct elements");
            test.ok(val.indexOf(2) === 1, "Contains correct elements");
            test.done();
        },

        returnsUndefined: function(test) {
            let val = this.previousConfig.get("sub.value.nothere");
            test.strictEqual(val, undefined, "Undefined should be returned for non-existing values");
            test.done();
        },

        returnsDefaultIfNotDefined: function(test) {
            let val = this.previousConfig.get("sub.thingy.maboby", false);
            test.strictEqual(val, false, "Default value should be returned");
            test.done();
        }

    },

    loadFromDefault: {

        loadsEmptyConfig: function(test) {
            Config
                .loadFromDefault(this.defaultConfiguration)
                .then(function(config) {
                    let numKeys = Object.keys(config._config).length;
                    test.strictEqual(numKeys, 0, "Loaded config should be empty");
                    test.done();
                });
        },

        loadsExistingConfig: function(test) {
            fs.writeFileSync(this.defaultConfigPath, JSON.stringify({
                test: {
                    value: 123
                }
            }));
            Config
                .loadFromDefault(this.defaultConfiguration)
                .then(function(config) {
                    test.strictEqual(config.get("test.value"), 123, "Config should have values");
                    test.done();
                });
        }

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

    saveWithDefault: {

        savesEmptyConfig: function(test) {
            Config
                .saveWithDefault(this.basicConfig, this.defaultConfiguration)
                .then(() => {
                    var content = fs.readFileSync(this.defaultConfigPath, "utf8"),
                        processed = JSON.parse(content);
                    test.strictEqual(Object.keys(processed).length, 0, "Should be an empty object");
                    test.done();
                })
                .catch(function(err) {
                    console.error(err);
                });
        },

        savesFilledConfig: function(test) {
            Config
                .saveWithDefault(this.previousConfig, this.defaultConfiguration)
                .then(() => {
                    var content = fs.readFileSync(this.defaultConfigPath, "utf8"),
                        processed = JSON.parse(content);
                    test.strictEqual(processed.collection.join(","), "1,2", "Included properties should exist");
                    test.done();
                })
                .catch(function(err) {
                    console.error(err);
                });
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
