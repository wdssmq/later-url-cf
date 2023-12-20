function genRSS(data) {
    // Build the XML string
    let rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <title>${data.title}</title>
          <link>${data.url}</link>
          <description>${data.description}</description>
          <language>zh-CN</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          <pubDate>${new Date().toUTCString()}</pubDate>
          `

    // Adding items to the feed
    data.items.forEach((item) => {
        rssFeed += `
          <item>
            <title>${item.title}</title>
            <link>${item.link}</link>
            <description>${item.description}</description>
            <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
          </item>`
    })

    // Closing tags
    rssFeed += `
        </channel>
      </rss>`

    return rssFeed
}

export default genRSS
