"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var app = (0, express_1.default)();
var PORT = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : '8080');
app.get('/', function (req, res) {
    //const name = process.env.NAME || 'World'
    res.send("Hello ".concat(req.ip, "!"));
});
app.post('vote', function (req, res) {
    res.send('lit');
});
app.listen(PORT, function () {
    console.log("helloworld: listening on port ".concat(PORT));
});
