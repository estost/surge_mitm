/*
README：https://github.com/yichahucha/surge/tree/master
 */

const $tool = new Tool();
const consoleLog = false;

if ($tool.isResponse) {
    let obj = JSON.parse($response.body);
    if (consoleLog) console.log("Letterboxd Original Body:\n" + $response.body);
    if (obj.links[2].type === "imdb") {
        const imdb_id = obj.links[2].id;

        const requestZhInfo = async () => {
            const Douban = await requestDoubanInfo(imdb_id);
            return Douban;
        }
        let dou = "";
        requestZhInfo()
            .then(Douban => dou = Douban)
            .catch(error => dou = error + "\n")
            .finally(() => {
                let chi_tit = Douban.film_zh;
                let chi_dir = Douban.dir_zh;
                let Director = obj.contributions[0].contributors[0];
                if (obj.originalName) {
                    obj["originalName"] = `${chi_tit} ${obj.originalName}`;
                } else {
                    obj["originalName"] = `${chi_tit}`;
                }
                Director["name"] = `${chi_dir} ${Director.name}`;
                if (consoleLog) console.log("Letterboxd Modified Body:\n" + JSON.stringify(obj));
                $done({body: JSON.stringify(obj)});
            });
    } else {
        $done({});
    }
}

function requestDoubanInfo(imdb_id) {
    return new Promise(function (resolve, reject) {
        const url = `https://www.douban.com/search?cat=1002&q=${imdb_id}`;
        if (consoleLog) console.log("Netflix Douban Rating URL:\n" + url);
        $tool.get(url, function (error, response, data) {
            if (!error) {
                if (consoleLog) console.log("Letterboxd Douban Data:\n" + data);
                if (response.status == 200) {
                    const film_zh = get_douban_zh_info(data).film_zh_title;
                    const dir_zh = get_douban_zh_info(data).dir_zh_name;
                    resolve({film_zh, dir_zh});
                } else {
                    resolve({rating: "Douban:  " + errorTip().noData});
                }
            } else {
                if (consoleLog) console.log("Letterboxd Douban Rating Error:\n" + error);
                resolve({rating: "Douban:  " + errorTip().error});
            }
        });
    });
}


function get_douban_zh_info(data) {
    const s = data.replace(/\n| |&#\d{2}/g, '')
        .match(/\[(\u7535\u5f71|\u7535\u89c6\u5267)\].+?subject-cast\">.+?<\/span>/g);
    const tit_match = s ? s.match(/<a[^>]+>([^<]+)<\/a>/);
    const film_zh_title = tit_match[1].trim();
    const dir_match = s ? s.match(/>\s*\u539f\u540d\s*:\s*([^/]+)\/\s*([^/]+)\s*\/\s*([^/]+)\s*\/\s*(\d{4})/);
    const dir_zh_name = dir_match[2].trim();
    const douban_info = {film_zh_title, dir_zh_name};
    return douban_info;
}

function errorTip() {
    return {noData: "⭐️ N/A", error: "❌ N/A"}
}

function Tool() {
    _node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({request})
        } else {
            return (null)
        }
    })()
    _isSurge = typeof $httpClient != "undefined"
    _isQuanX = typeof $task != "undefined"
    this.isSurge = _isSurge
    this.isQuanX = _isQuanX
    this.isResponse = typeof $response != "undefined"
    this.notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
        if (_node) console.log(JSON.stringify({title, subtitle, message}));
    }
    this.write = (value, key) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
    }
    this.read = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
    }
    this.get = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = {url: options}
            options["method"] = "GET"
            $task.fetch(options).then(response => {
                callback(null, _status(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.get(options, (error, response, body) => {
            callback(error, _status(response), body)
        })
        if (_node) _node.request(options, (error, response, body) => {
            callback(error, _status(response), body)
        })
    }
    this.post = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = {url: options}
            options["method"] = "POST"
            $task.fetch(options).then(response => {
                callback(null, _status(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.post(options, (error, response, body) => {
            callback(error, _status(response), body)
        })
        if (_node) _node.request.post(options, (error, response, body) => {
            callback(error, _status(response), body)
        })
    }
    _status = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
}
