addEventListener('fetch', (event) => {
    event.respondWith(
        handleRequest(event.request).catch(
            err => new Response(err.stack, { status: 500 }),
        ),
    )
})

const setCache = (key, data) => LATER_URL.put(key, JSON.stringify(data))
const getCache = (key, type = 'json') => LATER_URL.get(key, { type })
const hasItem = (item, data) => data.some(i => i.url === item.url)

// 环境变量 BEARER_TOKEN 用于鉴权
const BearerToken = 'Bearer ' + BEARER_TOKEN
// 环境变量指定最大记录数
const MaxCount = MAX_COUNT || 137

// 返回 JSON 格式的数据
const jsonResponse = data => new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
})

// 鉴权封装
const authCheck = reqToken => reqToken === BearerToken

// 处理请求
async function handleRequest(request) {
    const oRlt = {
        code: 200,
        msg: 'success',
        more: '',
    }

    // 获取请求的路径和参数
    const { pathname, searchParams } = new URL(request.url)

    // 获取 Token
    const curToken = request.headers.get('Authorization')

    // 获取分类
    const category = searchParams.get('category') || 'default'

    // 读取已有的数据， 数量到达上限时，删除最早的一个
    const db = await getCache(category) || []

    if (authCheck(curToken) && db.length > MaxCount) {
        db.shift()
    }

    // 添加一个新的记录
    if (pathname === '/add' && searchParams.has('url') && searchParams.has('title')) {
        // 添加新的记录
        const item = {
            url: searchParams.get('url'),
            title: searchParams.get('title'),
        }
        if (!authCheck(curToken)) {
            oRlt.code = 401;
            oRlt.msg = "Unauthorized";
            oRlt.more = `Authorization error ${curToken}`;
        } else if (!hasItem(item, db)) {
            db.push(item)
            setCache(category, db)
            oRlt.more = `added ${item.url}, all urls: ${db.length}`
        } else {
            oRlt.code = 400
            oRlt.msg = 'url already exists'
            oRlt.more = `${item.url} is exists, ${db.length} urls in ${category}`
        }
        return jsonResponse(oRlt)
    }

    // 查询所有记录
    if (pathname === '/list') {
        return jsonResponse(db)
    }

    return jsonResponse(oRlt)
}
