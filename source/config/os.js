const os = require("os");

module.exports = {

    getOSIdentifier: function() {
        switch(process.platform) {
            case "win32":
                return "windows";
            case "darwin":
                return "macos";
            case "freebsd":
                /* falls through */
            case "linux":
                return "linux";
            default:
                return null;
        }
    },

    getUserHomePath: function() {
        return os.homedir();
    }

};
