module.exports = (jsonpatch, mainTag, editTag) => ({
    onReceive({ payload, shadow, backup, onUpdateMain, afterUpdate }) {
        console.log("****************");
        console.log("\n--RECEIVED PAYLOAD --");
        console.log(mainTag + ": " + payload[mainTag]);
        console.log(editTag + ": ", payload.edits);
        console.log("-------------\n");

        console.log("\n-- CURRENT SHADOW --");
        console.log(shadow);
        console.log("----\n");

        //4
        if (shadow[mainTag] !== payload[mainTag]) {
            if (backup[mainTag] === payload[mainTag]) {
                console.log("\n-- REVERT --");
                console.log(backup);
                //revert to backup
                shadow.value = backup.value;
                shadow[mainTag] = backup[mainTag];
                shadow.edits = [];
                console.log("----\n");
            } else {
                console.log("** not match " + mainTag);
                return;
            }
        }

        //generate patch that ignore old n

        var filteredEdits = payload.edits.filter((edit) => edit[editTag] >= shadow[editTag]);

        //5a, 5b
        if (filteredEdits.length > 0) {
            var patches = filteredEdits.map((edit) => edit.patch);

            for (let patch of patches) {
                if (patch.length > 0) {
                    shadow.value = this.strPatch(shadow.value, patch);
                }
                //6
                shadow[editTag]++;
            }

            //backup
            //7
            backup.value = shadow.value;
            backup[mainTag] = shadow[mainTag];
            backup[editTag] = shadow[editTag];
            //clear old edits
            shadow.edits = shadow.edits.filter((edit) => edit[mainTag] > payload[mainTag]);

            onUpdateMain(patches);

            console.log("\n***RESULT****");
            console.log("shadow: ", shadow);

            if (afterUpdate) {
                afterUpdate();
            }
            console.log("**********\n");
        } else {
            console.log("**XXX* not match " + editTag);
        }
    },

    onSend(shadow, mainText, sendAnyway, whenSend) {
        //1a, 1b
        var patch = jsonpatch.compare(shadow.value, mainText);
        if (sendAnyway || patch.length > 0) {
            //2
            shadow.edits.push({
                [mainTag]: shadow[mainTag],
                patch,
            });

            //3
            shadow.value = mainText;
            shadow[mainTag]++;

            var payload = {
                [editTag]: shadow[editTag],
                edits: shadow.edits,
            };

            whenSend(payload);
        }
    },

    strPatch(val, patch) {
        return jsonpatch.applyPatch(val.split(""), patch).newDocument.join("");
    },
});
