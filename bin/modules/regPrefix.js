"use strict";
var __importDefault = (this && this.__importDefault) || function(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loglevel_plugin_prefix_1 = __importDefault(
    require("loglevel-plugin-prefix"),
);
const cli_color_1 = __importDefault(require("cli-color"));

function regPrefix(log) {
    try {
        loglevel_plugin_prefix_1.default.reg(log);
        log.enableAll();
        loglevel_plugin_prefix_1.default.apply(log, {
                    format(level, name, timestamp) {
                        switch (level) {
                            case "TRACE":
                                return `${cli_color_1.default.blackBright(`[${timestamp}]`)} ${
              cli_color_1.default.magenta(level)
            } ${cli_color_1.default.green(`${name}:`)}`;
          case "DEBUG":
            return `${cli_color_1.default.blackBright(`[${timestamp}]`)} ${
              cli_color_1.default.cyan(level)
            } ${cli_color_1.default.green(`${name}:`)}`;
          case "INFO":
            return `${cli_color_1.default.blackBright(`[${timestamp}]`)} ${
              cli_color_1.default.blue(level)
            } ${cli_color_1.default.green(`${name}:`)}`;
          case "ERROR":
            return `${cli_color_1.default.blackBright(`[${timestamp}]`)} ${
              cli_color_1.default.red(level)
            } ${cli_color_1.default.green(`${name}:`)}`;
          case "WARN":
            return `${cli_color_1.default.blackBright(`[${timestamp}]`)} ${
              cli_color_1.default.yellow(level)
            } ${cli_color_1.default.green(`${name}:`)}`;
        }
      },
    });
    loglevel_plugin_prefix_1.default.apply(log.getLogger("critical"), {
      format(level, name, timestamp) {
        return cli_color_1.default.red.bold(`[${timestamp}] ${level} ${name}:`);
      },
    });
    return log;
  } catch (err) {
    return new Error(err);
  }
}
module.exports = regPrefix;