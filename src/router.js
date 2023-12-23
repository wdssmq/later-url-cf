// 实现一个简单的路由类
class Router {
    constructor(routes) {
        this.routes = routes
    }

    resolve(reqPath) {
        const urlParts = reqPath.split('/')
        const routePath = `/${urlParts[1]}` // 获取主路径部分

        const _buildRoute = (routeConfig, pickRoute, params = {}) => {
            return {
                ...routeConfig,
                params,
                reqPath,
                pickRoute,
            }
        }

        if (this.routes[routePath]) {
            const routeConfig = this.routes[routePath]
            return _buildRoute(routeConfig, routePath)
        }
        // 提取 routes 中带 : 的路径
        const dynamicRoutes = Object.keys(this.routes).filter((route) => {
            return route.includes(':')
        })

        for (const route of dynamicRoutes) {
            // 如果 route 中含有 routePath 的前缀
            if (route.startsWith(routePath)) {
                const routeConfig = this.routes[route]
                // 提取动态路径参数
                const params = {}
                const routeParts = route.split('/')
                for (let i = 1; i < routeParts.length; i++) {
                    const part = routeParts[i]
                    if (part.startsWith(':')) {
                        const paramName = part.slice(1)
                        params[paramName] = urlParts[i] || routeConfig[paramName]
                        // 移除 routeConfig[paramName]
                        delete routeConfig[paramName]
                    }
                }
                return _buildRoute(routeConfig, route, params)
            }
        }

        return { type: 'notFound' }
    }
}

export default Router


