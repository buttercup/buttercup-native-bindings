const fs = require("fs");
const path = require("path");

const detectOS = require("./os.js").getOSIdentifier;

const defaults = {
    ButtercupCLI: {
        configFilename: ".buttercup-cli.config",
        configLocation: {
            macos: "~",
            linux: "~/.config",
            windows: "%UserProfile%"
        }
    }
};

function resolvePropertyContext(propertyChain, object) {
    if (propertyChain.length > 1) {
        let key = propertyChain.shift(),
            nextObject = (object.hasOwnProperty(key)) ? object[key] : (object[key] = {});
        if (typeof nextObject !== "object" || nextObject === null) {
            nextObject = {};
        }
        return resolvePropertyContext(propertyChain, nextObject);
    } else {
        return {
            config: object,
            lastKey: propertyChain.pop()
        }
    }
}

class Config {

    constructor(configuration, defaultObject) {
        if (typeof configuration !== "object") {
            throw new Error("Configuration should be of type 'object'");
        }
        this._config = Object.assign({}, configuration);
        this._default = defaultObject || null;
    }

    get(property, defaultValue) {
        let { config, lastKey } = resolvePropertyContext(property.split("."), this._config);
        if (config.hasOwnProperty(lastKey)) {
            return config[lastKey];
        }
        return defaultValue;
    }

    getRaw() {
        return Object.assign({}, this._config);
    }

    push(property, value) {
        let { config, lastKey } = resolvePropertyContext(property.split("."), this._config);
        if (Array.isArray(config[lastKey])) {
            config[lastKey].push(value);
        } else {
            config[lastKey] = [value];
        }
        return this;
    }

    save() {
        return Config.saveWithDefault(this, this._default);
    }

    write(property, value) {
        let { config, lastKey } = resolvePropertyContext(property.split("."), this._config);
        config[lastKey] = value;
        return this;
    }

}

Config.getPathForConfig = function getPathForConfig(defaultNameOrObject) {
    let def = (typeof defaultNameOrObject === "string") ? defaults[defaultName] : defaultNameOrObject;
    if (!def) {
        throw new Error(`Unknown default: ${defaultName}`);
    }
    let os = detectOS(),
        configPath = def.configLocation[os],
        configFilename = def.configFilename,
        absPath = path.resolve(path.join(configPath, configFilename));
    return absPath;
}

Config.loadFromDefault = function loadFromDefault(defaultNameOrObject) {
    let def = (typeof defaultNameOrObject === "string") ? defaults[defaultName] : defaultNameOrObject;
    if (!def) {
        throw new Error(`Unknown default: ${defaultName}`);
    }
    let raw,
        configPath = Config.getPathForConfig(def);
    return new Promise(function(resolve) {
        fs.readFile(configPath, "utf8", function(err, contents) {
            if (err) {
                resolve(new Config({}, def));
            } else {
                resolve(new Config(JSON.parse(contents), def));
            }
        });
    });
};

Config.saveWithDefault = function saveWithDefault(config, defaultNameOrObject) {
    let def = (typeof defaultNameOrObject === "string") ? defaults[defaultName] : defaultNameOrObject;
    if (!def) {
        throw new Error(`Unknown default: ${defaultName}`);
    }
    let configPath = Config.getPathForConfig(def);
    return new Promise(function(resolve, reject) {
        fs.writeFile(configPath, JSON.stringify(config.getRaw()), function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

module.exports = Config;
