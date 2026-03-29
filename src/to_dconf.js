function dict_path (my_dict, path = []) {
    const result = [];
    for (const [k, v] of Object.entries(my_dict)) {
        const newpath = [...path, k.trim()];
        if (typeof v === 'object' && v !== null) {
            result.push(...dict_path(v, newpath));
        } else {
            result.push([newpath, v]);
        }
    }
    return result;
}

function arraysAreEqual (array1, array2) {
    if (array1.length !== array2.length) {
        return false;
    }

    return array1.every((value, index) => value === array2[index]);
}

function json_dconf (data) {
    if (typeof data !== 'object' || data === null || Array.isArray(data))
        throw new TypeError(`Expected a plain object but got ${Array.isArray(data) ? 'array' : typeof data}.`);
    let conf = "";
    const paths = dict_path(data);
    let current_title = [];
    for (const path of paths) {
        const title = path[0].slice(0, -1);
        if (!arraysAreEqual(current_title, title)) {
            // add the title
            conf += `\n\n[${title.join("/")}]`;
            current_title = title;
        }
        // add the values under the title
        conf += `\n${path[0][path[0].length - 1]}=${path[1]}`;
    }
    if (conf[0] === "\n") {
        // remove first newlines
        conf = conf.slice(2);
    }
    return conf;
}


const fs = require("fs");

/**
Opens json file, converts to conf and writes to file
@param {string} json_path path to the json file to read
@param {string} dest path to save the dconf file
*/
function dconf_writer (json_path, dest = "output.conf") {
    fs.readFile(json_path, (err, jsonData) => {
        if (err) {
            console.error(err);
            return;
        }
        const data = JSON.parse(jsonData);
        const conf = json_dconf(data);
        fs.writeFile(dest, conf, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
    });
}

module.exports = { json_dconf, dconf_writer }