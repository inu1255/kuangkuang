import cofs from "./cofs";
const fs = require("fs");

let root = __dirname.split(/[\/\\]app.asar[\/\\]/);
if (root.length > 1) {
    root = root[0];
} else {
    root = ".";
}

let config = {
    save() {
        return cofs.writeJson("./config.json", config);
    },
    root
};

try {
    let data = new Function("return " + fs.readFileSync("./config.json", "utf8"))();
    Object.assign(config, data);
} catch (error) {}

export default config;