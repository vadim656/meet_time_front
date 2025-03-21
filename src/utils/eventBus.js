const EventEmitter = require("node:events");
class Events extends EventEmitter { }
const events = new Events();

module.exports = { events };
