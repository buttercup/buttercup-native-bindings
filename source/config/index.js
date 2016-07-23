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
        return undefined;
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

Config.loadFromDefault = function loadFromDefault(defaultName) {
    let def = defaults[defaultName];
    if (!def) {
        throw new Error(`Unknown default: ${defaultName}`);
    }
    let raw = fs.readFileSync(def.configFilename),
        config = JSON.parse(raw);
    return new Config(config);
};

module.exports = Config;
