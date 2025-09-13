// 使用 ES 模块语法，这是 Netlify Functions 推荐的方式
import fetch from 'node-fetch';

exports.handler = async (event, context) => {
  const { url } = event.queryStringParameters;

  // 1. 验证 URL 参数是否存在
  if (!url) {
    return {
      statusCode: 400,
      body: 'Missing "url" parameter',
    };
  }

  // 2. 验证 URL 格式是否正确
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return {
      statusCode: 400,
      body: 'Invalid URL format.',
    };
  }
  
  // 3. 避免代理无限循环
  if (parsedUrl.hostname === event.headers.host) {
    return {
      statusCode: 400,
      body: 'Cannot proxy to self to prevent infinite loops.'
    };
  }

  try {
    // 4. 发起代理请求，伪造 Referer 和 User-Agent
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        // 伪造 Referer，应对一些图床的防盗链
        'Referer': parsedUrl.origin,
        // 伪造 User-Agent，模拟普通浏览器访问
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    // 5. 检查响应状态码
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Failed to fetch image: ${response.statusText}`,
      };
    }

    // 6. 获取图片数据和类型
    const imageBuffer = await response.buffer();
    const mimeType = response.headers.get('content-type');

    // 7. 返回图片，并设置缓存标头
    return {
      statusCode: 200,
      headers: {
        'Content-Type': mimeType || 'application/octet-stream',
        // 强缓存一年，利用 Netlify CDN 进一步加速
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      body: imageBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Internal Server Error: ' + error.message,
    };
  }
};
