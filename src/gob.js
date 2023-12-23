const gob = {
    config: {
        debug: false,
        full_token: '',
        max_count: 137,
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

    // 时间戳秒数除以 86400 取整
    getDay() {
        return Math.floor(Date.now() / 86400000)
    },

    // 传入数组的长度除以 4 再取整
    getDivNum(arr) {
        return Math.floor(arr.length / 4) + 2
    },

    // 判断由对象组成的数组中是否存在符合条件的成员
    hasItemInArrData(item, arr, key = 'url') {
        return arr.some(i => i[key] === item[key])
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
        const curDay = gob.getDay()
        const divNum = gob.getDivNum(db)
        db.forEach((item, i) => {
            if (i % divNum === curDay % divNum) {
                newDb.push(item)
            }
        })
        return newDb
    },
}

export {
    gob,
}
