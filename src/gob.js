const gob = {
    config: {
        debug: false,
        full_token: '',
        max_count: 137,
    },
    router: {},
    kvStore: null,

    // 初始化
    init(kvStore, config, router) {
        this.config = config
        this.router = router
        this.kvStore = kvStore
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

    // 判断由对象组成的数组中是否存在符合条件的成员
    hasItemInArrData(item, arr, key = 'url') {
        return arr.some(i => i[key] === item[key])
    },
}

export {
    gob,
}
