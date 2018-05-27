# parcel-plugin-nunjucks
[Parcel](https://parceljs.org/) plugin to compile [Nunjucks](https://mozilla.github.io/nunjucks/) templates.


>
>If you build your front end code through parcel API, this extension may be useful to you, and you can call some of the predefined variables or functions in the JS through the injection of the nunjucks. render or the nunjucks. renderString function context parameters.

> I hope it will help some people, at least I need it.
> Finally, thank @devmattrick for creating this library. I just added some material. 😀
>



## Installation
`npm i parcel-plugin-nunjucks` or `yarn add parcel-plugin-nunjucks`

Parcel will now render nunjucks template files with an `.njk` extension.


 
## Parcel Api Useage
 
### In Js
```javascript

    const options = {
        outDir: 'dist/assets',             	// 将生成的文件放入输出目录下，默认为 dist
        //outFile: 'index.html',           	// 输出文件的名称
        publicUrl: '/assets',             	// 静态资源的 url ，默认为 dist
        watch: true,                		// 是否需要监听文件并在发生改变时重新编译它们，默认为 process.env.NODE_ENV !== 'production'
        cache: true,                		// 启用或禁用缓存，默认为 true
        cacheDir: '.cache',         		// 存放缓存的目录，默认为 .cache
        minify: false,              		// 压缩文件，当 process.env.NODE_ENV === 'production' 时，会启用
        target: 'browser',          		// 浏览器/node/electron, 默认为 browser
        https: false,               		// 服务器文件使用 https 或者 http，默认为 false
        logLevel: 3,                		// 3 = 输出所有内容，2 = 输出警告和错误, 1 = 输出错误
        hmrPort: 0,                 		// hmr socket 运行的端口，默认为随机空闲端口(在 Node.js 中，0 会被解析为随机空闲端口)
        sourceMaps: false,          		// 启用或禁用 sourcemaps，默认为启用(在精简版本中不支持)
        hmrHostname: '',            		// 热模块重载的主机名，默认为 ''
        detailedReport: true        		// 打印 bundles、资源、文件大小和使用时间的详细报告，默认为 false，只有在禁用监听状态时才打印报告
    };

    const bundler  = new Bundler('./src/views/*.njk',options)
    ...
    const bundle   = await bundler.bundle();

```


### In .nunjucksrc or an ["rc file"](https://github.com/davidtheclark/cosmiconfig) with the extensions .json, .yaml, .yml, or .js 
```javascript
{
  version : (new Date()).getTime()
}
```


### In nunjucks html template
```html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
    <meta name="viewport" content="initial-scale=1, maximum-scale=3, minimum-scale=1, user-scalable=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge,chrome=1">
    <meta http-equiv="Cache-Control" content="no-siteapp" />
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Cache-Control" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta name="renderer" content="webkit">
    <meta name="description" content="description"/>
    <meta name="keywords" content="keywords"/>
    <meta name="format-detection" content="telphone=no, email=no"/>
    <meta name="author" content="yonggang, mail@zhaiyonggang.com"/>
    <link rel="stylesheet" type="text/css" href="../css/main.css?version={{version}}" />
</head>
<body class="{{bodyclass}}">
    {% block content %} {% endblock%}
    {% block foot %} {% endblock%}
    <script type="text/javascript" src="../js/{{mainjs}}.js?version={{version}}" async></script>
</body>
</html>

```

### Output
```html

<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Home</title>
    <meta name="viewport" content="initial-scale=1, maximum-scale=3, minimum-scale=1, user-scalable=no">
    <meta http-equiv="x-ua-compatible" content="ie=edge,chrome=1">
    <meta http-equiv="Cache-Control" content="no-siteapp" />
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Cache-Control" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta name="renderer" content="webkit">
    <meta name="description" content="description"/>
    <meta name="keywords" content="keywords"/>
    <meta name="format-detection" content="telphone=no, email=no"/>
    <meta name="author" content="yonggang, mail@zhaiyonggang.com"/>
    <link rel="stylesheet" type="text/css" href="/assets/main.827c7c2c.css?version=1527135397030" />
</head>
<body class="box">
    <div>hello world</div>
    <script type="text/javascript" src="/assets/main.9d928ce8.js?version=1527135397030" async></script>
</body>
</html>

```
