# 海洋通信项目前端说明
## 1.离线地图开发说明
原理介绍：以百度地图为例，在连接网络的情况下，前端会去调用百度地图远程的地图工具包（某个js文件）。在断开网络状态，前端则无法请求到远程的地图工具包。实现地图离线展示需要提前准备地图瓦片、离线的地图工具包（js文件）、离线地图样式（css文件）。下面将介绍离线地图的开发过程：
1.从远程提前下载js和css文件
（1）首先访问 http://api.map.baidu.com/api?v=2.0&ak=你的百度地图key，
（2）界面会出现一段代码，复制内部的连接，例如https://api.map.baidu.com/getscriptv=2.0&ak=KjCZjTGeqgMrtfW1ts7UKggitD2ej23i&services=&t=20230104104957。访问此链接后会在页面出现远程js的源代码
（3）分别复制源代码保存至本地文件，自定义命名为xxx.js和xxx.css
（4）修改js文件，修改方法请参考 [这里](https://my.oschina.net/smzd/blog/548538 ) 

2.本地关联地图js文件、css文件
以vue为例，需要在index.html文件中引入：
```
<script type="text/javascript" src="/bdmap/js/apiv1.3.min.js"></script>
<link rel="stylesheet" type="text/css" href="/bdmap/css/bmap.css"/>
```

3.下载瓦片
（1）前往免费瓦片下载 [地址](http://wmksj.com/map.html )获取离线地图需要展示的位置
（2）说明x,y,z三个坐标含义: z表示地图的缩放级别，x表示地图瓦片的横向切割的坐标，y表示地图瓦片的纵向切割坐标
（3）瓦片文件结构说明：瓦片文件夹为三级目录，结构为z/x/y

4.测试
现在需要断开电脑的网络，启动前端服务，如果地图页面能够看到相关的离线瓦片，则说明离线地图开发成功～

备注：本项目需要离线展示的区域包括湖北漳河水库东部区域、三亚/陵水东南区域、广西涠洲岛东北区域，请读者自行下载并测试.
