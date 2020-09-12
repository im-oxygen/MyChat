const path = require("path");
const fs = require("fs-extra");

const cc = require("cli-color");
const toml = require("@iarna/toml");
const readlineSync = require("readline-sync");
const { default: axios } = require("axios");

const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

const Koa = require("koa");
const koaBodyParser = require("koa-body");
const koaCompress = require("koa-compress");
const koaFavicon = require("koa-favicon");
const koaRouter = require("@koa/router");
let koaSocket = require("koa-socket-2");
koaSocket = new koaSocket();

const log = require("loglevel");

require(path.normalize(__dirname + "/modules/regPrefix"))(log);

console.clear();
process.title = "MyChat - Server";

log.info(
    "\n",
    cc.cyan(
        cc.bold(
            fs.readFileSync(
                path.normalize(__dirname + "/modules/welcome.txt"),
                "utf8"
            )
        )
    )
);

let _config = toml.parse(
    fs.readFileSync(path.normalize(__dirname + "/../config.toml"), "utf8")
);

log.info("Config:", _config);

let app = new Koa();
let router = new koaRouter();
koaSocket.attach(app);
let io = app._io;
(async() =>
    (global.db = await sqlite.open({
        filename: path.normalize(
            __dirname + "/../" + _config.server.database.files.history
        ),
        driver: sqlite3.Database,
    })))();

app.use(koaBodyParser());

router.get("/", async(ctx, next) => {
    ctx.response.body = fs.readFileSync(
        path.normalize(__dirname + "/../public/pages/index.html"),
        "utf8"
    );
    await next();
});

router.get("/main.page", async(ctx, next) => {
    ctx.response.redirect("/");
    ctx.response.status = 301;
    await next();
});

router.get("/pwa/manifest.json", async(ctx) => {
    ctx.response.body = fs.readFileSync(
        path.normalize(__dirname + "/../public/app/manifest.json"),
        "utf8"
    );
    ctx.response.type = "application/json";
});

router.get("/sw.js", async(ctx) => {
    ctx.response.body = fs.readFileSync(
        path.normalize(__dirname + "/../public/app/sw.js"),
        "utf8"
    );
    ctx.response.type = "text/javascript";
});

router.get("/srv/res/", async(ctx, next) => {
    switch (ctx.URL.searchParams.get("type")) {
        case "script":
            switch (ctx.URL.searchParams.get("name")) {
                case "vue":
                    ctx.response.body = fs.readFileSync(
                        path.normalize(__dirname + "/../public/js/vue.js"),
                        "utf8"
                    );
                    ctx.response.headers["Content-Type"] = "text/javascript";
                    break;
                case "vue.min":
                    ctx.response.body = fs.readFileSync(
                        path.normalize(__dirname + "/../public/js/vue.min.js"),
                        "utf8"
                    );
                    ctx.response.headers["Content-Type"] = "text/javascript";
                    break;
                case "axios":
                    ctx.response.body = fs.readFileSync(
                        path.normalize(__dirname + "/../public/js/axios.min.js"),
                        "utf8"
                    );
                    ctx.response.headers["Content-Type"] = "text/javascript";
                    break;
                case "socketio":
                    ctx.response.body = fs.readFileSync(
                        path.normalize(__dirname + "/../public/js/socket.io.slim.js"),
                        "utf8"
                    );
                    ctx.response.headers["Content-Type"] = "text/javascript";
                    break;
                case "frontend.autorem":
                    ctx.response.body = fs.readFileSync(
                        path.normalize(__dirname + "/../public/js/frontend/autorem.js"),
                        "utf8"
                    );
                    ctx.response.headers["Content-Type"] = "text/javascript";
                    break;
                case "frontend.init":
                    ctx.response.body = fs.readFileSync(
                        path.normalize(__dirname + "/../public/js/frontend/init.js"),
                        "utf8"
                    );
                    ctx.response.headers["Content-Type"] = "text/javascript";
                    break;
            }
            break;
        case "image":
            switch (ctx.URL.searchParams.get("name")) {
                case "bing":
                    try {
                        let _data = await axios.get(
                            "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1"
                        );
                        ctx.response.redirect(
                            "https://www.bing.com" + _data.data.images[0].url
                        );
                        ctx.response.status = 301;
                        break;
                    } catch (e) {
                        log.error(e);
                        ctx.response.body = "";
                    }
            }
            break;
        case "style":
            switch (ctx.URL.searchParams.get("name")) {
                case "frontend.01":
                    ctx.response.body = fs.readFileSync(
                        path.normalize(__dirname + "/../public/styles/frontend-01.css"),
                        "utf8"
                    );
                    ctx.response.headers["Content-Type"] = "text/css";
            }
    }
    await next();
});

io.on("connection", async(conn) => {
    conn.on("request-test-mode", () => {
        log.warn("Allow Test-Mode? (Y/N)");
        if (readlineSync.keyInYNStrict("") == true) {
            log.info("Test-Mode Allowed!");
            conn.emit("allowed-test-mode");
            conn.on("echo", (a) => {
                log.warn(`${cc.yellowBright(cc.bold("[Test]"))} Client Echo: "${a}"`);
                conn.emit("echo-greet", `This Server: "${a}"`);
            });
        } else {
            log.info("Test-Mode Rejected!");
            conn.emit("rejected-test-mode");
        }
    });
    conn.on("get_msg_history", async() => {
        conn.emit("msg_history", await db.all("SELECT * FROM MESSAGES;"));
    });
    conn.on("commit_msg", async(s) => {
        await db.exec(`
      INSERT INTO MESSAGES (NICKNAME,TIMESTAMP,CONTENT)
      VALUES ('${s.name}', '${s.ts}', '${s.msg}');  
      `);
        log.info("New Message:", {
            NICKNAME: s.name,
            TIMESTAMP: s.ts,
            CONTENT: s.msg,
        });
        conn.broadcast.emit("update_msg", {
            NICKNAME: s.name,
            TIMESTAMP: s.ts,
            CONTENT: s.msg,
        });
    });
});
app.use(
    koaFavicon(path.normalize(__dirname + "/../" + _config.settings.favicon))
);
app.use(
    koaCompress({
        threshold: 2048,
        br: true,
    })
);
app.use(router.routes()).use(router.allowedMethods());
let server = app.listen(_config.server.port, 0, () => {
    log.info(
        `Server Started! http://${server.address().address}:${
      server.address().port
    }`
    );
});