const socketio = require("socket.io-client");
const path = require("path");
const fs = require("fs-extra");
const cc = require("cli-color");
const toml = require("@iarna/toml");
const log = require("loglevel");
require(path.normalize(__dirname + "/../bin/modules/regPrefix"))(log);

const _config = toml.parse(fs.readFileSync("../config.toml", "utf8"));

let io = socketio("http://localhost:" + _config.server.port);

log.info("Requesting Test-Mode");
io.emit("request-test-mode");
io.on("allowed-test-mode", () => {
    log.info("Test-Mode Allowed!");
    io.emit("echo", "This Client");
    io.on("echo-greet", (a) => {
        log.info(`Server Echo: '${a}'`);
    });
});
io.on("rejected-test-mode", () => {
    log.error("Test-Mode Rejected!");
    process.exit(9009);
});