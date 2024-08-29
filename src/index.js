/* global addEventListener LATER_URL BEARER_TOKEN MAX_COUNT PICK_RULE */

addEventListener('fetch', (event) => {
    event.respondWith(
        handleRequest(event.request).catch(
            err => new Response(err.stack, { status: 500 }),
        ),
    )
})

// 返回 JSON 格式的数据
const jsonResponse = data => new Response(JSON.stringify(data), {
    headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': data.resCookie || '',
    },
    status: data.code || 200,
    statusText: data.msg || 'success',
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
        pick_rule: {
            day_num: PICK_RULE.DAY_NUM,
            item_num: PICK_RULE.ITEM_NUM,
        },
        debug: IS_DEBUG || false,
    },
    // 路由配置
    {
        '/': {
            type: 'index',
        },
        '/add/:category': {
            type: 'add',
            category: 'default',
        },
        '/about': {
            type: 'about',
        },
        '/list/:category': {
            type: 'list',
            category: 'default',
        },
        '/admin/:category/:act': {
            type: 'admin',
            category: 'default',
            act: 'null',
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
        data: {},
    }

    // 获取请求的路径和参数
    const { pathname, searchParams } = new URL(request.url)
    // 获取 Cookie
    const reqCookie = request.headers.get('Cookie')

    // 获取路由信息
    const route = router.resolve(pathname)
    // return jsonResponse({ ...route  })
    const { type, params } = route

    // DEBUG 下输出路由信息
    if (gob.config.debug) {
        oRlt.route = route
    }

    // 获取 Token
    const curToken = request.headers.get('Authorization') || gob.parseCookie(reqCookie, 'Auth_Token')
    gob.reqToken = curToken

    // 获取分类
    const category = searchParams.get('category') || params?.category || 'default'
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
    if (type === 'add' && addInfo.checked) {
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
        oRlt.data.count = db.length
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

    // 管理记录
    if (type === 'admin') {
        if (!gob.isAuth(curToken)) {
            oRlt.code = 401
            oRlt.msg = 'Unauthorized'
            oRlt.more = `Authorization error ${curToken}`
            if (gob.config.debug) {
                oRlt.reqCookie = reqCookie
            }
            oRlt.resCookie = gob.setCookie('Auth_Token', 'empty', 11)
        } else {
            const allKeyInfo = await gob.manageList()
            oRlt.data = allKeyInfo
            if (params.act !== 'null') {
                // 判断 params.category 是否存在
                const isExist = allKeyInfo.some(key => key.name === params.category)
                if (params.act === 'del-cate' && isExist) {
                    await gob.delKeyValue(category)
                    oRlt.more = `delete category ${category}`
                } else {
                    oRlt.code = 400
                    oRlt.msg = 'Bad Request'
                    oRlt.more = `category ${category} not exists or action ${params.act} error`
                }
            }
        }
    }

    return jsonResponse(oRlt)
}
