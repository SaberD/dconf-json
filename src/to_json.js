function nesting (data, keys) {
    let X = keys;
    let d = data;

    for (let i = 0; i < X.length; i++) {
        let path = X[i];
        let currentLevel = d;

        for (let j = 0; j < path.length; j++) {
            let part = path[j];

            if (!currentLevel[part]) {
                currentLevel[part] = {};
            }

            currentLevel = currentLevel[part];
        }
    }

    return d;
}

function nested_set (dic, keys, values) {
    // uses the empty framework dict
    // sets the values given the dict and keys
    for (let i = 0; i < keys.length - 1; i++) {
        let key = keys[i];
        dic = dic[key] = dic[key] || {};
    }

    for (let i = 0; i < values.length; i++) {
        let li = values[i];
        dic[keys[keys.length - 1]][li[0]] = li[1].trim(); // remove trailing whitespace
    }
}

function dconf_json (dconf) {
    if (typeof dconf !== 'string')
        throw new TypeError(`Expected a string but got ${typeof dconf}.`);
    // Input list of string for each line.
    // Deploys a small hack by using whitespace at end of leafnode keys i.e. "media-keys " in stead of "media-keys"
    // This is important or else some conf values will get deleted because of how gnome conf structure its data is not 100% compatible with a hashtable.
    // Concrete example: custom-keybindings keyword appear twice in the gnome.conf file.
    let lines = dconf.split(/\r?\n/);
    let data = {};
    let L = [], D = [], C = [];
    for (let line of lines) {
        let sline = line.replace(/\n/g, " ");
        if (sline.startsWith('[')) {
            let structure = sline.split('/').map(a => a.replace(/[\[\]\n]/g, ''));
            structure[structure.length - 1] = structure[structure.length - 1] + ' ';
            L.push(structure);
            C.push(D);
            D = [];
        } else if (!sline.match(/^\s*$/)) {
            D.push(sline.split('=').map(a => a.replace(/\n/g, '').trim()));
        }
    }

    C.shift(); // remove first empty element
    C.push(D); // add last element

    nesting(data, L);


    for (let i = 0; i < L.length; i++) {
        nested_set(data, L[i], C[i]);
    }

    return data;
}


const fs = require('fs');

/**
Read *.conf file (exported by "dconf dump / > gnome.conf") and export as json.
@param {string} dconf_path The path to your dconf file"
@param {string} dest path to save the json file
*/
function json_writer (dconf_path, dest = "output.json") {
    const dconf = fs.readFileSync(dconf_path, { encoding: "utf-8" });

    const data = dconf_json(dconf);
    const json = JSON.stringify(data, null, 4);

    fs.writeFileSync(dest, json, { encoding: "utf-8" });
}

module.exports = { dconf_json, json_writer }
