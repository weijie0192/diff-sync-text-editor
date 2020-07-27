var $status = document.getElementById("status");
var $name = document.getElementById("name");
var $editors = document.getElementById("editors");
var $textfield = document.getElementById("textfield");
$name.value = localStorage.getItem("name");
$name.onchange = function () {
    var name = this.value;
    localStorage.setItem("name", name);
    send({
        action: "EDITORS",
        payload: {
            name: name,
        },
    });
};

var shadow = {
    n: 0,
    m: 0,
    value: "",
};
var backup = {
    n: 0,
    value: "",
};
var edits = [];

// Create WebSocket connection.
var socket = new WebSocket("ws://142.11.215.231:42998");

// Connection opened
socket.addEventListener("open", function (event) {
    $status.innerHTML = "ONLINE";
    send({
        action: "JOIN",
        payload: {
            name: $name.value,
        },
    });
});

// Connection closed
socket.addEventListener("close", function (event) {
    $status.innerHTML = "OFFLINE";
});
socket.addEventListener("error", function (event) {});

// Listen for messages
socket.addEventListener("message", function (event) {
    //   console.log(event.data);
    var { action, payload } = JSON.parse(event.data);

    console.log(action, payload);
    switch (action) {
        case "JOIN":
            $editors.innerHTML = payload.names;
            setText(payload.shadow.value);
            shadow = payload.shadow;
            backup = {
                ...shadow,
            };
            break;
        case "UPDATE_NAMES":
            $editors.innerHTML = payload.names;
            break;

        case "PATCH":
            if (shadow.n < payload.n) {
                shadow.value = backup.value;
                shadow.n--;
            }

            //generate patch that ignore old n
            var patches = payload.edits
                .filter((edit) => edit.m >= shadow.m)
                .map((edit) => edit.diff)
                .reduce((acc, edit) => {
                    for (let patch of edit) {
                        acc.push(patch);
                    }
                    return acc;
                }, []);

            console.log(patches);
            shadow.m++;
            //update shadow copy
            shadow.value = strPatch(shadow.value, patches);

            backup = {
                ...shadow,
            };
            edits = [];
            //update main copy
            setText(strPatch($textfield.value, patches));

            break;
    }
});

function strPatch(val, patch) {
    return jsonpatch.applyPatch(val.split(""), patch).newDocument.join("");
}

function send(data) {
    socket.send(JSON.stringify(data));
}

function setText(val) {
    var sel = getInputSelection($textfield);
    $textfield.value = val;
    setInputSelection($textfield, sel.start, sel.end);
}

//DIFFER SYNC

$textfield.onkeyup = function () {
    var diff = jsonpatch.compare(shadow.value, this.value);
    if (diff.length > 0) {
        edits.push({
            n: shadow.n,
            diff,
        });

        shadow.n++;
        shadow.value = this.value;
        console.log("send", edits);
        if (edits.length > 0)
            send({
                action: "PATCH",
                payload: {
                    edits,
                    m: shadow.m,
                },
            });
    }
};
function copy2Shadow() {
    backup.n = shadow.n;
    backup.value = shadow.value;

    shadow.m++;
    shadow.value = $textfield.value;
}
