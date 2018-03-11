import { Message } from 'element-ui';
import store from '../store';

const API = "http://localhost:3000/api";

const OPTION = {
    credentials: "include",
    headers: {
        "content-type": "application/json"
    }
};

function clearNull(value) {
    if (typeof value === "object" && !(value instanceof Array)) {
        let data = {};
        for (let k in value) {
            if (value[k] != null) {
                data[k] = clearNull(value[k]);
            }
        }
        return data;
    }
    return value;
}

function request(uri, data, headers) {
    var option = Object.assign({}, OPTION);
    if (data) {
        option.method = "POST";
        if (typeof data !== "string") {
            option.body = JSON.stringify(clearNull(data));
        } else
            option.body = data;
    }
    if (headers) {
        option.headers = headers;
    }
    // uri += (uri.indexOf("?") >= 0 ? "&" : "?") + "access_token="
    uri = /https?:\/\//.test(uri) ? uri : (API + uri);
    return new Promise(function(resolve, reject) {
        fetch(uri, option).then(function(res) {
            if (res.ok) return res.json();
        }, err => reject(err)).then(function(res) {
            if (!res) reject(404);
            else if (typeof res.no === "undefined") resolve(res);
            else if (res.no === 200) resolve(res.data);
            else if (res.no === 401) {
                if (uri.indexOf("logout") < 0) {
                    store.dispatch("logout");
                }
                reject(res.msg);
            } else {
                Message.error("" + res.msg);
                reject(res.msg);
            }
        });
    });
}

export default request;