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
var chance={
  server: 1,
  client: 1
}

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
                case "SET_CHANCE":{
                    chance[payload.name] = payload.value;
                    sendAll(
                        {
                            action: "SET_CHANCE",
                            payload: {
                                chance,
                            },
                        },
                        [ws]
                    );
                    break;
                }
                case "PATCH": {
                    
                    if(Math.random() >= 1- chance.server){
                      if (shadow.m > payload.m && backup.m === payload.m) {
                          console.log("revert!!", backup);
                          //revert to backup
                          shadow.value = backup.value;
                          shadow.m = backup.m;
                          ws.mdata.edits = [];
                      }
                      console.log(shadow);
  
                      //generate patch that ignore old n
                      
                      var filtered = payload.edits.filter((edit) => edit.n >= shadow.n);
                   
                      if(filtered.length > 0){
                         var patches = joinPatch(filtered);
                        console.log("patches:", patches);
                        //update shadow copy
                        shadow.value = strPatch(shadow.value, patches);
    
                        shadow.n = filtered[filtered.length -1].n+1;
                        console.log("shadow: ", shadow.value);
                        
                        
                        
                        //backup
                        ws.mdata.backup = {
                            ...shadow,
                        };
    
    
                        //update server copy
                        text = strPatch(text, patches);
                        console.log("main: ", text);
    
                        //clear old edits
                        ws.mdata.edits = [];
                        
                        if(Math.random() >= 1- chance.client){
                          editors.forEach(editor => patchClient(editor, editor === ws));
                        }
                      }

                    
                   }
                    break;
                }
                case "JOIN":
                    ws.mdata.name = payload.name || "Anonymous";
                    send(ws, {
                        action: "JOIN",
                        payload: {
                            names: getNames(),
                            shadow: shadow,
                            chance
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
                action: "UPDATE_NAMES",
                payload: {
                    names: getNames(),
                },
            },
            [ws]
        );
    });
});

function patchClient(editor, sendAnyway) {
    const { shadow, edits } = editor.mdata;
    var diff = jsonpatch.compare(shadow.value, text);
    if (sendAnyway || diff.length > 0) {
        edits.push({
            m: shadow.m,
            diff,
        });
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
