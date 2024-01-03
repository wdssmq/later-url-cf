/* global addEventListener LATER_URL BEARER_TOKEN MAX_COUNT */

addEventListener('fetch', (event) => {
    event.respondWith(
        handleRequest(event.request).catch(
            err => new Response(err.stack, { status: 500 }),
        ),
    )
})

// 返回 JSON 格式的数据
const jsonResponse = data => new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
})

// 返回 RSS 格式的数据
import genRSS from './feed'
const rssResponse = data => new Response(genRSS(data), {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
})

// 基础函数封装
import { gob } from './gob'
import Router from './router'

gob.init(
    // 绑定的 KV 空间
    LATER_URL,
    // 环境变量
    {
        full_token: 'Bearer ' + BEARER_TOKEN,
        max_count: MAX_COUNT || 137,
        // debug: true,
    },
    // 路由配置
    {
        '/': {
            type: 'index',
        },
        '/about': {
            type: 'about',
        },
        '/list/:category': {
            type: 'list',
            category: 'default',
        },
    },
)

const router = new Router(gob.router)

// 处理请求
async function handleRequest(request) {
    const oRlt = {
        code: 200,
        msg: 'success',
        more: '',
    }

    // 获取请求的路径和参数
    const { pathname, searchParams } = new URL(request.url)

    // 获取路由信息
    const route = router.resolve(pathname)
    // return jsonResponse({ ...route  })
    const { type, params } = route

    // 获取 Token
    const curToken = request.headers.get('Authorization')
    gob.reqToken = curToken

    // 获取分类
    const category = searchParams.get('category') || params.category || 'default'
    // return jsonResponse({ category })

    const addInfo = {
        url: searchParams.get('url') || '',
        title: searchParams.get('title') || '',
        date: searchParams.get('date') || '',
    }

    addInfo.checked = addInfo.url && addInfo.title && addInfo.date

    // 附加信息
    const metadata = {
        author: searchParams.get('author') || 'later-url',
    }

    // 添加一个新的记录
    if (pathname === '/add' && addInfo.checked) {
        const db = await gob.readDb(category)
        // 添加新的记录
        const item = addInfo
        if (!gob.isAuth(curToken)) {
            oRlt.code = 401
            oRlt.msg = 'Unauthorized'
            oRlt.more = `Authorization error ${curToken}`
        } else if (!gob.hasItemInArrData(item, db)) {
            db.push(item)
            await gob.setKeyValue(category, db, metadata)
            oRlt.more = `added ${item.url}, count: ${db.length}, category: ${category}`
        } else {
            oRlt.code = 400
            oRlt.msg = 'url already exists'
            oRlt.more = `${item.url} is exists, count: ${db.length}, category: ${category}`
        }
        return jsonResponse(oRlt)
    }

    // 查询记录并输出
    if (type === 'list') {
        const rndKeyInfo = await gob.getRndKeyInfo()
        const { name: category, metadata } = rndKeyInfo
        const db = await gob.readDb(category)
        const lessDb = gob.lessDb(db)
        // return jsonResponse(db)
        const feedName = metadata.author || 'null'
        const feedUrl = gob.getUrlByKey(category)
        return rssResponse({
            title: `later-url - ${feedName}`,
            url: feedUrl,
            description: 'later-url',
            items: lessDb.map(item => ({
                title: `${feedName} - ${item.title}`,
                link: item.url,
                description: gob.getItemDesc(feedName, feedUrl, item.title),
                pubDate: new Date().toUTCString(),
            })),
        })
    }

    return jsonResponse(oRlt)
}
