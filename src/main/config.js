import cofs from "./cofs";
const fs = require("fs");

let config = {
    save() {
        return cofs.writeJson("./config.json", config);
    }
};

try {
	let data = new Function("return "+fs.readFileSync("./config.json","utf8"))();
	Object.assign(config, data);
} catch (error) { }

export default config;