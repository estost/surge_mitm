/*
README：https://github.com/yichahucha/surge/tree/master
 */

const tmdb_api = "05902896074695709d7763505bb88b4d";
const $tool = new Tool();
const consoleLog = true;

if ($tool.isResponse) {
    let obj = JSON.parse($response.body);
    if (consoleLog) {
        console.log("Letterboxd Original Body:\n" + $response.body);
    }
    if (obj.contributions[0].type === "Director") {
        const dir_tmdbid = obj.contributions[0].contributors[0].tmdbid;
        const imdb_id = obj.links[2].id;
        const requestDir = async () => {
            const dir_zh_info = await requestDirZH(dir_tmdbid);
            const Douban = await requestDoubanRating(imdb_id);
            const film_zh = Douban.film_zh_title;
            const dir_zh_bf = Douban.dir_zh_name;
            const dir_zh = film_zh + dir_zh_bf;
            return dir_zh;
        };
        let msg = "";
        requestDir()
            .then(dir_zh => msg = dir_zh)
            .catch(error => msg = error + "\n")
            .finally(() => {
                let dir_en_name = obj.contributions[0].contributors[0].name;
                let dir_info = obj.contributions[0].contributors[0];
                dir_info["name"] = `${msg} ${dir_en_name}`;
                if (consoleLog) console.log("Netflix Modified Body:\n" + JSON.stringify(obj));
                $done({body: JSON.stringify(obj)});
            });
    } else {
        $done({});
    }
}

function getZhName(also_known_as) {

    // 判断是不是简体中文字符
    function isSimpChinese(char) {
        return /^[\u4E00-\u9FA5]+$/.test(char);
    }

    // 判断是不是繁体中文字符
    function isTradChinese(char) {
        return /^[\u4E00-\u9FFF]+$/.test(char);
    }

    // 判断是不是日文汉字
    function isJapaneseKanji(char) {
        return /^[\u4E00-\u9FFF\u3400-\u4DBF]+$/.test(char);
    }

    // 判断是不是日文平假名
    function isHiragana(char) {
        return /^[\u3040-\u309F]+$/.test(char);
    }

    // 判断是不是日文片假名
    function isKatakana(char) {
        return /^[\u30A0-\u30FF]+$/.test(char);
    }

    function isHangul(char) {
        const unicode = char.charCodeAt(0);
        return unicode >= 0xAC00 && unicode <= 0xD7AF;
    }

    const weights = {
        "汉": {"simp": 10, "trad": 8, "jap": 7},
        "ひらがな": {"jap": 2},
        "カタカナ": {"jap": -2},
        "kor": {"kor": -3}
    };

    let maxWeight = 0;
    let zhjaName = "";

    let isAllNonChineseJapanese = true; // 新增变量，记录是否所有名字都不含汉字和平假名

    for (let i = 0; i < also_known_as.length; i++) {
        const name = also_known_as[i];
        let weight = 0;

        if (/（豆瓣）$/.test(name))
            return name.replace('（豆瓣）', '');

        let isNonChineseJapanese = true; // 新增变量，记录当前名字是否不含汉字和平假名

        for (let j = 0; j < name.length; j++) {
            let char = name[j];

            if (isSimpChinese(char)) {
                weight += weights["汉"]["simp"] || 0;
                isNonChineseJapanese = false;
            } else if (isTradChinese(char)) {
                weight += weights["汉"]["trad"] || 0;
                isNonChineseJapanese = false;
            } else if (isJapaneseKanji(char)) {
                weight += weights["汉"]["jap"] || 0;
                isNonChineseJapanese = false;
            } else if (isHiragana(char)) {
                weight += weights["ひらがな"]["jap"] || 0;
                isNonChineseJapanese = false;
            } else if (isKatakana(char)) {
                weight += weights["カタカナ"]["jap"] || 0;
                isNonChineseJapanese = false;
            } else if (isHangul(char)) {
                weight += weights["kor"]["kor"] || 0;
            }
        }

        if (isNonChineseJapanese) {
            continue; // 如果当前名字不含汉字和平假名，则继续循环下一个名字
        } else {
            isAllNonChineseJapanese = false; // 反之，记录当前名字为包含汉字和平假名的名字
        }

        if (weight > maxWeight) {
            maxWeight = weight;
            zhjaName = name;
        }
    }

    if (isAllNonChineseJapanese) {
        return ""; // 如果所有名字都不含汉字和平假名，则返回 null
    }

    let return_name = zhjaName || '';
    return return_name.replace('（dorama.info）', '').replace('（旧芸名）', '').replace('（本名）', '');
}

function requestDirZH(dir_tmdbid) {
    return new Promise(function (resolve, reject) {
        const dir_url = "https://api.themoviedb.org/3/person/" + dir_tmdbid + "?api_key=" + tmdb_api;
        if (consoleLog) {
            console.log("Director TMDb API URL:\n" + dir_url);
        }
        $tool.get(dir_url, function (error, response, data) {
            if (!error) {
                const tmdb_data = JSON.parse(data);
                if (tmdb_data.also_known_as) {
                    const dir_aka_name = tmdb_data.also_known_as;
                    const dir_zh_name = getZhName(dir_aka_name).replace(' ', '');
                    const zh_aka = "name";
                    resolve({dir_zh_name, zh_aka});
                } else {
                    reject(errorTip().noData);
                }
            } else {
                if (consoleLog) console.log("Director TMDb API Data:\n" + error);
                reject(errorTip().error);
            }
        });
    });
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
    const average = s ? s[0].split(/">(\d\.\d)</)[1] || '' : '';
    const numRaters = s ? s[0].split(/(\d+)\u4eba\u8bc4\u4ef7/)[1] || '' : '';
    const rating_message = `Douban:  ⭐️ ${average ? average + "/10" : "N/A"}   ${!numRaters ? "" : parseFloat(numRaters).toLocaleString()}`;
    const sStr = JSON.stringify(s);
    const tit_match = sStr ? sStr.match(/<a[^>]+>([^<]+)<\/a>/) : null;
    const film_zh_title = tit_match[1].trim();
    const dir_match = sStr ? sStr.match(/>\s*\u539f\u540d\s*:\s*([^/]+)\/\s*([^/]+)\s*\/\s*([^/]+)\s*\/\s*(\d{4})/) : null;
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
