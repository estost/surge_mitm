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

    if (obj.links[1].type === "tmdb") {
        const tmdb_id = obj.links[1].id;
        const requestZH = async () => {
            const title_zh = await requestTitleZH(tmdb_id);
            return title_zh;
        };
        let title = "";
        requestZH()
            .then(title_zh => title = title_zh)
            .catch(error => title = error + "\n")
            .finally(() => {
                let title_re = title + " " + obj.originalName;
                obj["originalName"] = title_re;
                if (consoleLog) console.log("Letterboxd TMDB Body:\n" + JSON.stringify(obj));
                $done({body: JSON.stringify(obj)});
            });

        const dir_tmdbid = obj.contributions[0].contributors[0].tmdbid;
        const requestDir = async () => {
            const dir_zh = await requestDirZH(dir_tmdbid);
            return dir_zh;
        };
        let dir = "";
        requestDir()
            .then(dir_zh => dir = dir_zh)
            .catch(error => dir = error + "\n")
            .finally(() => {
                let dir_en_name = obj.contributions[0].contributors[0].name;
                let dir_info = obj.contributions[0].contributors[0];
                dir_info["name"] = `${dir} ${dir_en_name}`;
                if (consoleLog) console.log("Netflix Modified Body:\n" + JSON.stringify(obj));
                $done({body: JSON.stringify(obj)});
            });

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

    function requestTitleZH(tmdb_id) {
        return new Promise(function (resolve, reject) {
            const title_url = "https://api.themoviedb.org/3/movie/" + tmdb_id + "?api_key=" + tmdb_api + "&language=zh-CN";
            if (consoleLog) {
                console.log("Director TMDb API URL:\n" + title_url);
            }
            $tool.get(title_url, function (error, response, data) {
                if (!error) {
                    const tmdb_zh_data = JSON.parse(data);
                    let tmdb_zh_title = tmdb_zh_data.title;
                    if (tmdb_zh_title) {
                        resolve(tmdb_zh_title);
                    } else {
                        reject(errorTip().noData);
                    }
                } else {
                    if (consoleLog) console.log("ZHTitle TMDb API Data:\n" + error);
                    reject(errorTip().error);
                }
            });
        });
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
                        resolve(dir_zh_name);
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
