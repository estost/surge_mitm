/*
README：https://github.com/yichahucha/surge/tree/master
 */

const $tool = new Tool();
const consoleLog = true;

if ($tool.isResponse) {
    let obj = JSON.parse($response.body);
    if (consoleLog) {
        console.log("Letterboxd Original Body:\n" + $response.body);
    }
    if (obj.links[2].type === "imdb" && obj.contributions[0].contributions[0] && obj.languages[0]) {
        const imdb_id = obj.links[2].id;
        const requestZH = async () => {
            const Douban = await requestDoubanRating(imdb_id);
            const film_zh = Douban.film_zh_title;
            const dir_zh = Douban.dir_zh_name;
            const data_zh = film_zh + "|" +dir_zh;
            return data_zh;
        };
        let msg = "";
        requestZH()
            .then(data_zh => msg = data_zh)
            .catch(error => msg = error + "\n")
            .finally(() => {
                let chi_name = msg.split('|')[0];
                let chi_dir = msg.split('|')[1];
                let oriName = obj.originalName;

                if (obj["originalName"]) {
                    if (obj.languages[0].name !== 'Chinese' && obj.languages[0].name !== 'Cantonese') {
                        let re_name = `${chi_name} ${oriName}`;
                        if (obj.languages[0].name !== 'Japanese') {
                            if (re_name.length > 22) {
                                obj["originalName"] = `${chi_name}\n${oriName}`;
                            } else {
                                obj["originalName"] = `${chi_name} ${oriName}`;
                            }
                        } else if (hasJapanese(chi_name)) {
                            if (re_name.length > 22) {
                                obj["originalName"] = `${chi_name}\n${oriName}`;
                            } else {
                                obj["originalName"] = `${chi_name} ${oriName}`;
                            }
                        }
                    }
                } else {
                    obj["originalName"] = `${chi_name}`;
                }

                let dir_en_name = obj.contributions[0].contributors[0].name;
                let dir_info = obj.contributions[0].contributors[0];
                dir_info["name"] = `${chi_dir} ${dir_en_name}`;
                if (consoleLog) console.log("Netflix Modified Body:\n" + JSON.stringify(obj));
                $done({body: JSON.stringify(obj)});
            });
    } else {
    $done({});
}
}

function requestDoubanRating(imdbId) {
    return new Promise(function (resolve, reject) {
        const url = `https://www.douban.com/search?cat=1002&q=${imdbId}`;
        if (consoleLog) console.log("Netflix Douban Rating URL:\n" + url);
        $tool.get(url, function (error, response, data) {
            if (!error) {
                if (consoleLog) console.log("Netflix Douban Rating Data:\n" + data);
                if (response.status == 200) {
                    const douban_data = get_douban_rating_message(data);
                    resolve(douban_data);
                } else {
                    resolve({ rating: "Douban:  " + errorTip().noData });
                }
            } else {
                if (consoleLog) console.log("Netflix Douban Rating Error:\n" + error);
                resolve({ rating: "Douban:  " + errorTip().error });
            }
        });
    });
}

function get_douban_rating_message(data) {
    const s = data.replace(/\n| |&#\d{2}/g, '')
    .match(/\[(\u7535\u5f71|\u7535\u89c6\u5267)\].+?subject-cast\">.+?<\/span>/g);
    const sStr = JSON.stringify(s);
    const tit_match = sStr ? sStr.match(/<a[^>]+>([^<]+)<\/a>/) : null;
    const film_zh_title = tit_match[1].trim();
    const dir_match = sStr ? sStr.match(/>\s*\u539f\u540d\s*:\s*([^/]+)\/\s*([^/]+)\s*\/\s*([^/]+)\s*\/\s*(\d{4})/) : null;
    const dir_zh_name = dir_match[2].trim();
    const douban_info = {film_zh_title, dir_zh_name};
    return douban_info;
}

function hasJapanese(str) {
    var regExp = /[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\uFF65-\uFF9F]/g;
    return regExp.test(str);
}

function errorTip() {
    return {noData: "", error: ""}
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
