var $status = document.getElementById("status");
var $name = document.getElementById("name");
var $editors = document.getElementById("editors");
var $textfield = document.getElementById("textfield");
var $timeoutIndicator = document.getElementById("timeoutIndicator");
var $timeoutDelayLabel = document.getElementById("timeoutDelayLabel");
var $timeoutDelay = document.getElementById("timeoutDelay");
var $mnLabel = document.getElementById("mnLabel");
var $serverChance = document.getElementById("serverChance");
var $clientChance = document.getElementById("clientChance");
var $field = document.getElementById("field");
var $auto = document.getElementById("auto");

var interval = null;
$auto.onchange = function () {
    var i = 0;
    if (interval) {
        clearInterval(interval);
        interval = null;
        i = 0;
    } else {
        interval = setInterval(() => {
            $textfield.value = $textfield.value + i++ + ", ";
            sendPatch($textfield.value);
        }, 2000);
    }
};

function onChanceChange() {
    send({
        action: "SET_CHANCE",
        payload: {
            name: this.getAttribute("name"),
            value: this.value,
        },
    });
}
$serverChance.onchange = onChanceChange;
$clientChance.onchange = onChanceChange;

$timeoutDelay.oninput = function () {
    $timeoutDelayLabel.innerHTML = "Patch Delay: " + this.value + "ms";
};

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
    $field.disabled = false;
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
    $field.disabled = true;
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
            $serverChance.value = payload.chance.server;
            $clientChance.value = payload.chance.client;
            break;
        case "UPDATE_NAMES":
            $editors.innerHTML = payload.names;
            break;
        case "SET_CHANCE":
            $serverChance.value = payload.chance.server;
            $clientChance.value = payload.chance.client;
            break;
        case "PATCH":
            if (shadow.n > payload.n && backup.n === payload.n) {
                shadow.value = backup.value;
                shadow.n = backup.n;
                console.log("revert!!", backup, shadow);
                edits = edits.filter((edit) => edit.n > shadow.n);
            }

            //generate patch that ignore old n
            var filtered = payload.edits.filter((edit) => edit.m >= shadow.m);

            if (filtered.length > 0) {
                var patches = filtered
                    .map((edit) => edit.diff)
                    .reduce((acc, edit) => {
                        for (let patch of edit) {
                            acc.push(patch);
                        }
                        return acc;
                    }, []);

                shadow.value = strPatch(shadow.value, patches);
            }

            console.log("server generated patch", patches);
            shadow.m = filtered[filtered.length - 1].m;
            //update shadow copy

            backup = {
                ...shadow,
            };
            shadow.m++;

            edits = edits.filter((edit) => edit.n > payload.n);

            if (filtered.length > 0) {
                //update main copy
                setText(strPatch($textfield.value, patches));
                updateMNLabel();
            }

            break;
    }
});

function updateMNLabel() {
    $mnLabel.innerHTML = `N:${shadow.n} M:${shadow.m}`;
}

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

var timeout = null;
$textfield.onkeyup = function () {
    clearTimeout(timeout);

    var delay = parseInt($timeoutDelay.value);

    if (delay > 0) {
        $timeoutIndicator.innerHTML = "Processing...";
        timeout = setTimeout(() => {
            sendPatch(this.value);
        }, delay);
    } else {
        sendPatch(this.value);
    }
};

function sendPatch(text) {
    $timeoutIndicator.innerHTML = "Patched!";
    var diff = jsonpatch.compare(shadow.value, text);
    if (diff.length > 0) {
        edits.push({
            n: shadow.n,
            diff,
        });

        shadow.value = text;
        shadow.n++;
        updateMNLabel();

        var payload = {
            edits,
            m: shadow.m,
        };
        console.log("send", JSON.stringify(payload));

        send({
            action: "PATCH",
            payload,
        });
    }
}

function copy2Shadow() {
    backup.n = shadow.n;
    backup.value = shadow.value;

    shadow.m++;
    shadow.value = $textfield.value;
}
