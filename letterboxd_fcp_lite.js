const $tool = new Tool();
const consoleLog = false;

var obj = JSON.parse($response.body);
const re_seaFilm = 'FilmSearchItem';
const re_seaList = 'ListSearchItem';
const re_title = '/api/v0/film/';
const re_poster = '/api/v0/list/';
const re_list = '/api/v0/lists?';
const re_cont = '/api/v0/contributor/';
const re_entries = '/api/v0/log-entries?';
const re_entry = '/api/v0/log-entry/';
const re_watched = '/api/v0/films?';
const re_watlist = '/watchlist?';

if ($request.url.indexOf(re_seaFilm) !== -1) {
    obj.items.forEach(function (sea_item) {
        if (sea_item.film.adult) {
            let poster = sea_item.film.poster;
            let a_sizes = sea_item.film.adultPoster.sizes;
            poster.sizes = a_sizes;
        }
    });
    $done({body: JSON.stringify(obj)});
}

if ($request.url.indexOf(re_seaList) !== -1) {
    obj.items.forEach(function (item) {
        let sea_item_list = item.list;
        sea_item_list.previewEntries.forEach(function (tit_item) {
            if (tit_item.film.adult) {
                let poster = tit_item.film.poster;
                let a_sizes = tit_item.film.adultPoster.sizes;
                poster.sizes = a_sizes;
            }
        });
    });
    $done({body: JSON.stringify(obj)});
}

if ($request.url.indexOf(re_title) !== -1) {
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
                if (obj.adultPoster) {
                    let poster = obj.poster;
                    let a_sizes = obj.adultPoster.sizes;
                    poster.sizes = a_sizes;
                }

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

if ($request.url.indexOf(re_poster) !== -1) {
    obj.items.forEach(function (item) {
        if (item.film.adult) {
            let poster = item.film.poster;
            let a_sizes = item.film.adultPoster.sizes;
            poster.sizes = a_sizes;
        }
    });
    $done({body: JSON.stringify(obj)});
}

if ($request.url.indexOf(re_list) !== -1) {
    obj.items.forEach(function (item) {
        item.previewEntries.forEach(function (tit_item) {
            if (tit_item.film.adult) {
                let poster = tit_item.film.poster;
                let a_sizes = tit_item.film.adultPoster.sizes;
                poster.sizes = a_sizes;
            }
        });
    });
    $done({body: JSON.stringify(obj)});
}

if ($request.url.indexOf(re_cont) !== -1) {
    obj.items.forEach(function (con_item) {
        if (con_item.film.adult) {
            let poster = con_item.film.poster;
            let a_sizes = con_item.film.adultPoster.sizes;
            poster.sizes = a_sizes;
        }
    });
    $done({body: JSON.stringify(obj)});
}

if ($request.url.indexOf(re_entries) !== -1) {
    obj.items.forEach(function (ent_item) {
        if (ent_item.film.adult) {
            let poster = ent_item.film.poster;
            let a_sizes = ent_item.film.adultPoster.sizes;
            poster.sizes = a_sizes;
        }
    });
    $done({body: JSON.stringify(obj)});
}

if ($request.url.indexOf(re_entry) !== -1) {
    if (obj.film.adult) {
        let poster = obj.film.poster;
        let a_sizes = obj.film.adultPoster.sizes;
        poster.sizes = a_sizes;
    }
    $done({body: JSON.stringify(obj)});
}

if ($request.url.indexOf(re_watched) !== -1) {
    obj.items.forEach(function (wat_item) {
        if (wat_item.adult) {
            let poster = wat_item.poster;
            let a_sizes = wat_item.adultPoster.sizes;
            poster.sizes = a_sizes;
        }
    });
    $done({body: JSON.stringify(obj)});
}

if ($request.url.indexOf(re_watlist) !== -1) {
    obj.items.forEach(function (wli_item) {
        if (wli_item.adult) {
            let poster = wli_item.poster;
            let a_sizes = wli_item.adultPoster.sizes;
            poster.sizes = a_sizes;
        }
    });
    $done({body: JSON.stringify(obj)});
}

function requestDoubanInfo(imdbId) {
    return new Promise(function (resolve, reject) {
        const url = `https://www.douban.com/search?cat=1002&q=${imdbId}`;
        if (consoleLog) console.log("Letterboxd Douban URL:\n" + url);
        $tool.get(url, function (error, response, data) {
            if (!error) {
                if (consoleLog) console.log("Letterboxd Douban Data:\n" + data);
                if (response.status === 200) {
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
