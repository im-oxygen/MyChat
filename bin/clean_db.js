const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const fs = require("fs-extra");
const toml = require("@iarna/toml");

let _config = toml.parse(
    fs.readFileSync(path.normalize(__dirname + "/../config.toml"), "utf8")
);
(async() => {
    let db = await sqlite.open({
        filename: path.normalize(
            __dirname + "/../" + _config.server.database.files.history
        ),
        driver: sqlite3.Database,
    });
    db.exec("DELETE FROM MESSAGES");
})();