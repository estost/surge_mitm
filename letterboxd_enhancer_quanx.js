/*************************************

项目功能：Letterboxd 中文增强显示 Lite

**************************************

[rewrite_local]
^https?://api\.letterboxd\.com/api/v0/film/[a-zA-Z0-9]+\?apikey=[a-zA-Z0-9-]+&nonce=[a-zA-Z0-9-]+&timestamp=[0-9]+&signature=[a-zA-Z0-9]+ url script-response-body https://raw.githubusercontent.com/estost/surge_mitm/master/letterboxd_enhancer_quanx.js

[mitm]
hostname = api.letterboxd.com

*************************************/


const $tool = new Tool();
const consoleLog = false;

if ($tool.isResponse) {
    let obj = JSON.parse($response.body);
    if (consoleLog) console.log("Letterboxd Original Body:\n" + $response.body);
    if (obj.links[2].type === "imdb") {
        const imdb_id = obj.links[2].id;
        const requestZH = async () => {
            const Douban = await requestDoubanInfo(imdb_id);
            const film_zh = Douban.film_zh_title;
            const dir_zh = Douban.dir_zh_name;
            const data_zh = film_zh + "|" + dir_zh;
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
                let re_name = `${chi_name} ${oriName}`;

                if (obj["originalName"]) {
                    if (obj.languages[0].name !== 'Chinese' && obj.languages[0].name !== 'Cantonese' && !hasJapanese(chi_name)) {
                        if (obj.languages[0].name === 'Japanese' && hasJapanese(oriName)) {
                            if (re_name.length > 22) {
                                obj["originalName"] = `${chi_name}\n${oriName}`;
                            } else {
                                obj["originalName"] = `${chi_name} ${oriName}`;
                            }
                        } else if (obj.languages[0].name !== 'Japanese' && hasChinese(chi_name)) {
                            if (re_name.length > 22) {
                                obj["originalName"] = `${chi_name}\n${oriName}`;
                            } else {
                                obj["originalName"] = `${chi_name} ${oriName}`;
                            }
                        }
                    }
                } else if (hasChinese(chi_name)) {
                    obj["originalName"] = `${chi_name}`;
                }

                let dir_en_name = obj.contributions[0].contributors[0].name;
                let dir_info = obj.contributions[0].contributors[0];
                if (hasChinese(chi_dir)) {
                    dir_info["name"] = `${chi_dir} ${dir_en_name}`;
                }
                if (consoleLog) console.log("Letterboxd Modified Body:\n" + JSON.stringify(obj));
                $done({body: JSON.stringify(obj)});
            });
    } else {
        $done({});
    }
}

function requestDoubanInfo(imdbId) {
    return new Promise(function (resolve, reject) {
        const url = `https://www.douban.com/search?cat=1002&q=${imdbId}`;
        if (consoleLog) console.log("Letterboxd Douban URL:\n" + url);
        $tool.get(url, function (error, response, data) {
            if (!error) {
                if (consoleLog) console.log("Letterboxd Douban Data:\n" + data);
                if (response.status == 200) {
                    const douban_data = get_douban_info(data);
                    resolve(douban_data);
                } else {
                    resolve({rating: "Douban:  " + errorTip().noData});
                }
            } else {
                if (consoleLog) console.log("Letterboxd Douban Error:\n" + error);
                resolve({rating: "Douban:  " + errorTip().error});
            }
        });
    });
}

function get_douban_info(data) {
    let film_zh_title = '';
    let dir_zh_name = '';
    if (!data.match("\u6CA1\u6709\u627E\u5230\u4E0E")) {
        const s = data.replace(/\n| |&#\d{2}/g, '')
            .match(/\[(\u7535\u5f71|\u7535\u89c6\u5267)\].+?subject-cast\">.+?<\/span>/g);
        const sStr = JSON.stringify(s);
        const tit_match = sStr ? sStr.match(/<a[^>]+>([^<]+)<\/a>/) : null;
        const dir_match = sStr ? sStr.match(/>\s*\u539f\u540d\s*:\s*([^/]+)\/\s*([^/]+)\s*\/\s*([^/]+)\s*\/\s*(\d{4})/) : null;
        if (tit_match) film_zh_title = tit_match[1].trim();
        if (dir_match) dir_zh_name = dir_match[2].trim();
    }
    let douban_info = {film_zh_title, dir_zh_name};
    return douban_info;
}

function hasJapanese(str) {
    var regExp = /[\u3040-\u309F\u30A0-\u30FF]/g;
    return regExp.test(str);
}

function hasChinese(str) {
    var regExp = /[\u4E00-\u9FA5\u4E00-\u9FFF]/g;
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
