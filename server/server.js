/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var jsonpatch = require("fast-json-patch");
var WebSocket = require("ws");
var uid = require("uid");
var wss = new WebSocket.Server({ port: 42998 });
var text = "";

var editors = [];

wss.on("connection", function (ws, req) {
    var shadow = {
        n: 0,
        m: 0,
        value: text,
    };
    var backup = {
        ...shadow,
    };
    ws.mdata = {
        shadow: shadow,
        edits: [],
    };
    editors.push(ws);

    ws.on("message", function (json) {
        try {
            var data = JSON.parse(json);
            var { action, payload } = data;
            console.log(data);
            switch (action) {
                case "PATCH": {
                    if (shadow.m < payload.m) {
                        shadow.value = backup.value;
                        shadow.m--;
                    }
                    console.log(shadow);

                    //generate patch that ignore old n
                    var patches = joinPatch(payload.edits.filter((edit) => edit.n >= shadow.n));

                    console.log("patches:", patches);
                    //update shadow copy
                    shadow.value = strPatch(shadow.value, patches);

                    console.log("shadow: ", shadow.value);
                    shadow.n++;

                    //update server copy
                    text = strPatch(text, patches);
                    console.log("main: ", text);

                    ws.mdata.edits = [];

                    editors.forEach((editor) => {
                        patchClient(editor);
                    });
                    break;
                }
                case "JOIN":
                    ws.mdata.name = payload.name || "Anonymous";
                    send(ws, {
                        action: "JOIN",
                        payload: {
                            names: getNames(),
                            shadow: shadow,
                        },
                    });
                    sendAll(
                        {
                            action: "UPDATE_NAMES",
                            payload: {
                                names: getNames(),
                            },
                        },
                        [ws]
                    );
                    break;
                case "EDITORS":
                    ws.mdata.name = payload.name || "Anonymous";
                    sendAll({
                        action: "UPDATE_NAMES",
                        payload: {
                            names: getNames(),
                        },
                    });
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    });

    //LEAVE
    ws.on("close", function (e) {
        editors = editors.filter((editor) => editor !== ws);
        sendAll(
            {
                action: "LEAVE",
                payload: {
                    names: getNames(),
                },
            },
            [ws]
        );
    });
});

function patchClient(editor) {
    const { shadow, edits } = editor.mdata;
    var diff = jsonpatch.compare(shadow.value, text);
    if (diff.length > 0) {
        edits.push({
            m: shadow.m,
            diff,
        });
    }

    editor.mdata.backup = {
        ...shadow,
    };
    shadow.value = text;
    shadow.m++;
    send(editor, {
        action: "PATCH",
        payload: {
            n: shadow.n,
            edits: edits,
        },
    });
}

function joinPatch(edits) {
    return edits
        .map((edit) => edit.diff)
        .reduce((acc, edit) => {
            for (let patch of edit) {
                acc.push(patch);
            }
            return acc;
        }, []);
}

function strPatch(val, patch) {
    return jsonpatch.applyPatch(val.split(""), patch).newDocument.join("");
}

function getNames() {
    return editors.map((editor) => editor.mdata.name).join(", ");
}
function data2json(data) {
    return typeof data === "string" ? data : JSON.stringify(data);
}
function send(ws, data) {
    ws.send(data2json(data));
}

function sendAll(data, excepts = []) {
    var json = data2json(data);
    editors.forEach((editor) => {
        if (!excepts.includes(editor)) {
            editor.send(json);
        }
    });
}
