# chaoxingpan-image-proxy

用于解决超星云盘（学习通）做个人博客图床时，无法正常访问图片的问题。也就是使用代理

## 使用
1、fork到你的仓库，然后托管到Netlify

2、绑定你博客的子域名（可选，需要你博客的主域名被管理在Netlify）

3、使用了路由，所以访问图片的地址变成了https://subdomain.you-domain.com/image/?url=[图片地址]

> 想改路由的话可以修改netlify.toml文件`from`部分
