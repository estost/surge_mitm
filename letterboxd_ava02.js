const $tool = new Tool();
const consoleLog = false;

if ($tool.isResponse) {
    let obj = JSON.parse($response.body);
    if (consoleLog) console.log("Letterboxd PT Original Body:\n" + $response.body);
    if (obj.items) {
        const pter_obj = {
      "displayName": "Pter",
      "icon": "data:image/webp;base64,UklGRuAEAABXRUJQVlA4TNQEAAAvH8AHEBpJ27YdzvPUtm3btm3bdpuMJ05t27b7E7y3bbsNZ5Jq/+6+Y47saq2CVW09+Q46tG0d26sd27ZtO6ls27ZV2pWd1Kqc0q2ta1Q2vzvl2tp27NGVJ7ad33w/xLatznZmOpvVHAePwFZlq7NRuXulgAJAUM4/MzGZs217yba9ZNtbtpmMZNtesnX2vQkgj8PTf33IPenRlGMeDjvs3jAXD7g17eIfX1qSy37WttCxMiIlJbv59t7Lgmh6iQSJ5HPiDRZn7M3Ne7tMPFR/zHc9RWssfDjm8UILHS4RJqmXS612UUEf6AXyO8M4TrVm190Pk+zXbb9O1gW6wgZbflno+k4gJMeM73aHy4oOGEJRFJpwqiiK0hdmKFeibd/FrIMcH0QQoDc0hCWWiix0ugOE5slrlHyi33oNEUEDWnglgEIRiNgfgoFXRqBB941VkqdC/8VGZ9x5QVT6QhvYWbhw0AHCnJRN3NqdrdbuYkjL80qr80rzE1ZB8zMqr//PUXigCWSB/SlL67Mlmp9S3jc45mJ41POryfaaq0mqmq/5bx0MoCaQJVrDLGN5d/zvDSFACBSne8SSsiJCcqZACqe8DZesYWFTuK1A19Zv9J/xXiENIkx5ufI2TkqHQRImREjhFEjqwrRVzNQ4JRxTYpXNzWt9oaTIyxGIviGUYx7MhxCQDpu0FZVWmIIcoBp+HClc2k4cIeRCOJG+Rs373u+yGACxO5i47ClcXSMFITJ8HCcaHzZoALEfvLvm9SwnBMKIxMXtTz3uBOkAsRsM4nfY7blSEDJjxvO4822fAGKoQZ7rfnV2BqF9+jrlP1Rf5Aug0hEmacu74XNvqa+pqtrfVG89AsgQ7WCW/iILnUQsdKgDJG9akz31PCHIQGvY5MgZCx0rBWFY9k4lJdyvGV7hRxUMfz5yv+uiHf1WfnX0voWOI4RU675Ut8wGV55RshCKwD7w44Qnw4g0RBaXGF9KEE0AfDJGsrrbrA+QhJejvx0tO1o4vWmHY4t3FE6uWv/3vqPD/yguCXxE5IhmMNfcQwgBmWGTubvmllJfWAIHwFh5yo6sfp65nXpJixTaCdrD0yccIPJEG6DkueV7YxkQ4qLEebHlOcWDqIYhCuVu2nK/xGz/Bx4oePIEEV8+b/U/+v2b7oxXnYlMCHUTlFRve9wN0gFF4HP60yJpi7XcrX/M+c8AXq/XK4AIpN+fGPR25Pn5Hz+nQwjIhdAzfQPrj+qLXAFEI7S/6ihIkqa7HR8WVg0WwSSeQTy9ZHrpxF8d+j/1q33I+6Hd8o1hRD6EKXn6lVTwfyfzIAUjiAa7gl8S1g68ZF5bKi9WBQVH+/+UmKq+FBphvszRK3QubcPwuuhxtCeuQhLXVZhXTgAv0jBUglR94gpy9yv9svXvUzcLtOzMhJAKIQlCKHE9GC4Fx+vvsYjAEDgAJnDKO8zzOnyy2xI3Q0iOGd/tDlcMHsSeMJlp89NrfYm7ITRPUt780OeJmx4QO8NYVSx0ttsg9MvU2irgv89mgJcv/y8y8clCB7sNEjunzPQqRtHMhBb+NPwbS/7ZfZG4HcKFAoNNLY+Va7jf1mCvrfxGB/rW4I+zng9wG4RgKMaQCIkeEy6Z/SAZAyAZgyCMKtpxJok8ngE=",
      "country": "CHN",
      "url": "https://pterclub.com",
      "types": [
        "buy"
      ],
      "serviceCode": "pt-pter"
    };
        obj.items.splice(0, 0, pter_obj);

        $done({body: JSON.stringify(obj)});

        /*
        let avatar = obj.items[obj.items.length - 1].member.avatar;
        avatar["sizes"] = [
            {
              "width": 144,
              "height": 144,
              "url": "https://a.ltrbxd.com/resized/avatar/upload/4/6/4/8/0/2/4/shard/avtr-0-144-0-144-crop.jpg?v=5a9cad3fec"
            },
            {
              "width": 300,
              "height": 300,
              "url": "https://a.ltrbxd.com/resized/avatar/upload/4/6/4/8/0/2/4/shard/avtr-0-300-0-300-crop.jpg?v=5a9cad3fec"
            }
          ];
        */
        /*const imdb_id = obj.links[2].id;
        const requestPT = async () => {
            const Douban = await requestPTSource(imdb_id);
            const Douban = {"film_zh_title": "123", "dir_zh_name": "789"};
            const film_zh = Douban.film_zh_title;
            const dir_zh = Douban.dir_zh_name;
            const data_zh = film_zh + "|" + dir_zh;
            return data_zh;
        };
        let msg = "";
        requestPT()
            .then(data_zh => msg = data_zh)
            .catch(error => msg = error + "\n")
            .finally(() => {
                pter_obj = `
                {
      "member": {
        "id": "2zDHd",
        "username": "Pter",
        "givenName": "Pter",
        "displayName": "Pter",
        "shortName": "Pter",
        "pronoun": {
          "id": "3R",
          "label": "He / his",
          "subjectPronoun": "he",
          "objectPronoun": "him",
          "possessiveAdjective": "his",
          "possessivePronoun": "his",
          "reflexive": "himself"
        },
        "avatar": {
          "sizes": [
            {
              "width": 144,
              "height": 144,
              "url": "https://pterclub.com/favicon.ico"
            },
            {
              "width": 300,
              "height": 300,
              "url": "https://pterclub.com/favicon.ico"
            }
          ]
        },
        "memberStatus": "Patron",
        "hideAdsInContent": false,
        "accountStatus": "Active",
        "hideAds": false
      },
      "relationship": {
        "watched": false,
        "liked": false,
        "favorited": false,
        "inWatchlist": true,
        "whenAddedToWatchlist": "2023-04-22T09:53:57Z",
        "reviews": [],
        "diaryEntries": []
      }
    },`;
                obj.items.splice(0, 0, pter_obj);
            });
        */
    } else {
        $done({});
    }
}

function requestPTSource(imdbId) {
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
