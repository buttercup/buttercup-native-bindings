const fs = require("fs");

const defaults = {
    ButtercupCLI: {
        configFilename: ".buttercup-cli.config"
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

    constructor(configuration) {
        if (typeof configuration !== "object") {
            throw new Error("Configuration should be of type 'object'");
        }
        this._config = Object.assign({}, configuration);
    }

    get(property, defaultValue) {
        let { config, lastKey } = resolvePropertyContext(property.split("."), this._config);
        if (config.hasOwnProperty(lastKey)) {
            return config[lastKey];
        }
        return defaultValue;
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

    write(property, value) {
        let { config, lastKey } = resolvePropertyContext(property.split("."), this._config);
        config[lastKey] = value;
        return this;
    }

}

Config.loadFromDefault = function loadFromDefault(defaultNameOrObject) {
    let def = (typeof defaultNameOrObject === "string") ? defaults[defaultName] : defaultNameOrObject;
    if (!def) {
        throw new Error(`Unknown default: ${defaultName}`);
    }
    let raw;
    return new Promise(function(resolve) {
        fs.readFile(def.configFilename, "utf8", function(err, contents) {
            if (err) {
                resolve(new Config({}));
            } else {
                resolve(new Config(JSON.parse(contents)));
            }
        });
    });
};

module.exports = Config;
