const gob = {
    config: {
        debug: false,
        full_token: '',
        max_count: 137,
        pick_rule: {
            day_num: 4,
            item_num: 4,
        },
    },
    router: {},
    kvStore: null,
    reqToken: '',

    // 初始化
    init(kvStore, config, router) {
        this.config = config
        this.router = router
        this.kvStore = kvStore
    },

    // 时间戳秒数除转换成天数
    getDayStamp(dayNum = 4) {
        const timestamp = Math.floor(Date.now() / 1000)
        // 一天的秒数 86400
        const daySec = 86400
        const divNum = daySec * dayNum
        return Math.floor(timestamp / divNum)
    },

    // 传入数组的长度除以 4 再取整
    getDivNum(arr, num = 4) {
        return Math.floor(arr.length / num)
    },

    // 判断由对象组成的数组中是否存在符合条件的成员
    hasItemInArrData(item, arr, key = 'url') {
        return arr.some(i => i[key] === item[key])
    },

    // 由键名获取数据源 url
    getUrlByKey(key) {
        // 如果 key 格式为 bilibili_1234567890
        if (key.match(/^bilibili_\d+$/)) {
            return `https://space.bilibili.com/${key.split('_')[1]}/video`
        }
    },

    // 拼接 RSS Item Description
    getItemDesc(feedName, feedUrl, itemTitle) {
        return `<![CDATA[
            <p>${itemTitle} - ${feedName}</p>
            <p><a href="${feedUrl}" title="${feedName}">${feedUrl}</a></p>
        ]]>`
    },

    // 鉴权封装
    isAuth(reqToken) {
        return reqToken === this.config.full_token
    },

    // kvStore.list()
    async listKeyValue() {
        const list = await this.kvStore.list()
        return list
    },

    // kvStore.get()
    async getKeyValue(key, type = 'json') {
        const data = await this.kvStore.get(key, { type })
        return data
    },

    // kvStore.put()
    async setKeyValue(key, data, metadata = {}) {
        const result = await this.kvStore.put(key, JSON.stringify(data), { metadata })
        return result
    },

    // 读取指定 key 的数据
    async readDb(key, type = 'json') {
        const db = await this.getKeyValue(key, type) || []
        // 数量到达上限时，删除最早的一个
        if (gob.isAuth(this.reqToken) && db.length > gob.config.max_count) {
            db.shift()
            // await gob.setKeyValue(key, db)
        }
        return db
    },

    // 随机获取一个 key
    async getRndKeyInfo() {
        const kvInfo = await this.listKeyValue()
        const dbKeys = kvInfo.keys
        if (dbKeys.length === 0) return { name: 'default', metadata: {} }
        const randomIndex = Math.floor(Math.random() * dbKeys.length)
        return dbKeys[randomIndex]
    },

    // 按条件返回一部分数据
    lessDb(db) {
        const newDb = []
        const dayStamp = gob.getDayStamp(gob.config.pick_rule.day_num)
        const divNum = gob.getDivNum(db, gob.config.pick_rule.item_num)
        db.forEach((item, i) => {
            if (i % divNum === dayStamp % divNum) {
                newDb.push(item)
            }
        })
        return newDb
    },
}

export {
    gob,
}
