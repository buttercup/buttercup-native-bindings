const assert = require("chai").assert;

const fs = require("fs");
const rimraf = require("rimraf");

const Module = require("../../source/index.js");

const Config = Module.Config;

describe("Config", function() {

    beforeEach(function() {
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
                linux: ".",
                windows: "."
            }
        };
        this.defaultConfigPath = Config.getPathForConfig(this.defaultConfiguration);
        rimraf.sync(this.defaultConfigPath);
    });

    afterEach(function() {
        rimraf.sync(this.defaultConfigPath);
    });

    describe("get", function() {

        it("gets values", function() {
            let val = this.previousConfig.get("sub.value", true);
            assert.strictEqual(val, null, "Correct value should be returned");
        });

        it("gets array values", function() {
            let val = this.previousConfig.get("collection");
            assert.ok(val.indexOf(1) === 0, "Contains correct elements");
            assert.ok(val.indexOf(2) === 1, "Contains correct elements");
        });

        it("returns undefined", function() {
            let val = this.previousConfig.get("sub.value.nothere");
            assert.strictEqual(val, undefined, "Undefined should be returned for non-existing values");
        });

        it("returns default if not defined", function() {
            let val = this.previousConfig.get("sub.thingy.maboby", false);
            assert.strictEqual(val, false, "Default value should be returned");
        });

    });

    describe("loadFromDefault", function() {

        it("loads empty config", function(done) {
            Config
                .loadFromDefault(this.defaultConfiguration)
                .then(function(config) {
                    let numKeys = Object.keys(config._config).length;
                    assert.strictEqual(numKeys, 0, "Loaded config should be empty");
                    done();
                });
        });

        it("loads existing config", function(done) {
            fs.writeFileSync(this.defaultConfigPath, JSON.stringify({
                test: {
                    value: 123
                }
            }));
            Config
                .loadFromDefault(this.defaultConfiguration)
                .then(function(config) {
                    assert.strictEqual(config.get("test.value"), 123, "Config should have values");
                    done();
                });
        });

    });

    describe("push", function() {

        it("creates new array", function() {
            this.basicConfig
                .push("my.collection", "a")
                .push("my.collection", "b")
                .push("my.collection", "c");
            assert.strictEqual(this.basicConfig._config.my.collection.join(","), "a,b,c", "All values should be pushed");
        });

        it("pushes to existing", function() {
            this.previousConfig.push("collection", 0);
            assert.strictEqual(this.previousConfig._config.collection.join(","), "1,2,0", "All values should be pushed");
        });

    });

    describe("saveWithDefault", function() {

        it("saves empty config", function(done) {
            Config
                .saveWithDefault(this.basicConfig, this.defaultConfiguration)
                .then(() => {
                    var content = fs.readFileSync(this.defaultConfigPath, "utf8"),
                        processed = JSON.parse(content);
                    assert.strictEqual(Object.keys(processed).length, 0, "Should be an empty object");
                    done();
                })
                .catch(function(err) {
                    console.error(err);
                });
        });

        it("saves filled config", function(done) {
            Config
                .saveWithDefault(this.previousConfig, this.defaultConfiguration)
                .then(() => {
                    var content = fs.readFileSync(this.defaultConfigPath, "utf8"),
                        processed = JSON.parse(content);
                    assert.strictEqual(processed.collection.join(","), "1,2", "Included properties should exist");
                    done();
                })
                .catch(function(err) {
                    console.error(err);
                });
        });

    });

    describe("write", function() {

        it("sets value", function() {
            this.basicConfig.write("my.nested.value", 123);
            assert.strictEqual(this.basicConfig._config.my.nested.value, 123, "Set value should be correct");
        });

    });

});
