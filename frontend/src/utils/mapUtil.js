//坐标转换
//WGS84：为一种大地坐标系，也是目前广泛使用的GPS全球卫星定位系统使用的坐标系。
//GCJ02：又称火星坐标系，是由中国国家测绘局制订的地理信息系统的坐标系统。由WGS84坐标系经加密后的坐标系
//BD09：为百度坐标系，在GCJ02坐标系基础上再次加密。其中bd09ll表示百度经纬度坐标，bd09mc表示百度墨卡托米制坐标。
//h5在微信浏览器里、uniapp是使用 gcj02 国测局坐标系

const { func } = require("prop-types");

//WGS84  GCJ02  BD09
const PI = 3.14159265358979324;
const x_pi = 3.14159265358979324 * 3000.0 / 180.0;
const delta = (lat, lon) => {
    // Krasovsky 1940
    //
    // a = 6378245.0, 1/f = 298.3
    // b = a * (1 - f)
    // ee = (a^2 - b^2) / a^2;
    var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
    var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
    var dLat =  transformLat(lon - 105.0, lat - 35.0);
    var dLon =  transformLon(lon - 105.0, lat - 35.0);
    var radLat = lat / 180.0 *  PI;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) *  PI);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) *  PI);
    return {
        'lat': dLat,
        'lon': dLon
    };
}

//WGS-84 to GCJ-02
const gcj_encrypt = (wgsLat, wgsLon) => {
    if ( outOfChina(wgsLat, wgsLon))
        return {
            'lat': wgsLat,
            'lon': wgsLon
        };

    var d =  delta(wgsLat, wgsLon);
    return {
        'lat': wgsLat + d.lat,
        'lon': wgsLon + d.lon
    };
}

//GCJ-02 to WGS-84
const gcj_decrypt_To_wgs = (gcjLat, gcjLon) => {
    if ( outOfChina(gcjLat, gcjLon))
        return {
            'lat': gcjLat,
            'lon': gcjLon
        };

    var d =  delta(gcjLat, gcjLon);
    return {
        'lat': gcjLat - d.lat,
        'lon': gcjLon - d.lon
    };
}

//GCJ-02 to WGS-84 exactly
const gcj_decrypt_exact = (gcjLat, gcjLon) => {
    var initDelta = 0.01;
    var threshold = 0.000000001;
    var dLat = initDelta,
        dLon = initDelta;
    var mLat = gcjLat - dLat,
        mLon = gcjLon - dLon;
    var pLat = gcjLat + dLat,
        pLon = gcjLon + dLon;
    var wgsLat, wgsLon, i = 0;
    while (1) {
        wgsLat = (mLat + pLat) / 2;
        wgsLon = (mLon + pLon) / 2;
        var tmp =  gcj_encrypt(wgsLat, wgsLon)
        dLat = tmp.lat - gcjLat;
        dLon = tmp.lon - gcjLon;
        if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold))
            break;

        if (dLat > 0) pLat = wgsLat;
        else mLat = wgsLat;
        if (dLon > 0) pLon = wgsLon;
        else mLon = wgsLon;

        if (++i > 10000) break;
    }
    //console.log(i);
    return {
        'lat': wgsLat,
        'lon': wgsLon
    };
}

//GCJ-02 to BD-09
const bd_encrypt = (gcjLat, gcjLon) => {
    var x = gcjLon,
        y = gcjLat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    let bdLon = z * Math.cos(theta) + 0.0065;
    let bdLat = z * Math.sin(theta) + 0.006;
    return {
        'lat': bdLat,
        'lon': bdLon
    };
}
//BD-09 to GCJ-02
const bd_decrypt_To_gcj = (bdLat, bdLon) => {
    var x = bdLon - 0.0065,
        y = bdLat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gcjLon = z * Math.cos(theta);
    var gcjLat = z * Math.sin(theta);
    return {
        'lat': gcjLat,
        'lon': gcjLon
    };
}
//WGS-84 to Web mercator
//mercatorLat -> y mercatorLon -> x
const mercator_encrypt = (wgsLat, wgsLon) => {
    var x = wgsLon * 20037508.34 / 180.;
    var y = Math.log(Math.tan((90. + wgsLat) *  PI / 360.)) / ( PI / 180.);
    y = y * 20037508.34 / 180.;
    return {
        'lat': y,
        'lon': x
    };
    /*
     if ((Math.abs(wgsLon) > 180 || Math.abs(wgsLat) > 90))
     return null;
     var x = 6378137.0 * wgsLon * 0.017453292519943295;
     var a = wgsLat * 0.017453292519943295;
     var y = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
     return {'lat' : y, 'lon' : x};
     //*/
}
// Web mercator to WGS-84
// mercatorLat -> y mercatorLon -> x
const mercator_decrypt = (mercatorLat, mercatorLon) => {
    var x = mercatorLon / 20037508.34 * 180.;
    var y = mercatorLat / 20037508.34 * 180.;
    y = 180 /  PI * (2 * Math.atan(Math.exp(y *  PI / 180.)) -  PI / 2);
    return {
        'lat': y,
        'lon': x
    };
    /*
     if (Math.abs(mercatorLon) < 180 && Math.abs(mercatorLat) < 90)
     return null;
     if ((Math.abs(mercatorLon) > 20037508.3427892) || (Math.abs(mercatorLat) > 20037508.3427892))
     return null;
     var a = mercatorLon / 6378137.0 * 57.295779513082323;
     var x = a - (Math.floor(((a + 180.0) / 360.0)) * 360.0);
     var y = (1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * mercatorLat) / 6378137.0)))) * 57.295779513082323;
     return {'lat' : y, 'lon' : x};
     //*/
}

// bd转wgs
const bd_to_wgs = (bdLon, bdLat) => {
    // 1. bd to gcj
    let gcj_location = bd_decrypt_To_gcj(bdLat, bdLon)
    // 2.gcj to wgs
    let wgs_location = gcj_decrypt_exact(gcj_location.lat, gcj_location.lon)    
    return {
        'lat': wgs_location.lat,
        'lng': wgs_location.lon
    }
}

// wgs转bd
const wgs_to_bd = (wgsLon, wgsLat) => {
    // 1.wgs to gcj
    let gcj_location = gcj_encrypt(wgsLat, wgsLon)
    // 2.gcj to bd
    let bd_location = bd_encrypt(gcj_location.lat, gcj_location.lon)
    return {
        'lat': bd_location.lat,
        'lng': bd_location.lon
    }
}

// two point's distance
const distance = (latA, lonA, latB, lonB) => {
    var earthR = 6371000.;
    var x = Math.cos(latA *  PI / 180.) * Math.cos(latB *  PI / 180.) * Math.cos((lonA - lonB) *  PI / 180);
    var y = Math.sin(latA *  PI / 180.) * Math.sin(latB *  PI / 180.);
    var s = x + y;
    if (s > 1) s = 1;
    if (s < -1) s = -1;
    var alpha = Math.acos(s);
    var distance = alpha * earthR;
    return distance;
}
const outOfChina = (lat, lon) => {
    if (lon < 72.004 || lon > 137.8347)
        return true;
    if (lat < 0.8293 || lat > 55.8271)
        return true;
    return false;
}
const transformLat = (x, y) => {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x *  PI) + 20.0 * Math.sin(2.0 * x *  PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y *  PI) + 40.0 * Math.sin(y / 3.0 *  PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 *  PI) + 320 * Math.sin(y *  PI / 30.0)) * 2.0 / 3.0;
    return ret;
}
const transformLon = (x, y) => {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x *  PI) + 20.0 * Math.sin(2.0 * x *  PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x *  PI) + 40.0 * Math.sin(x / 3.0 *  PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 *  PI) + 300.0 * Math.sin(x / 30.0 *  PI)) * 2.0 / 3.0;
    return ret;
}

// 计算wgs坐标两点之间距离
function getDistance( lat1, lng1, lat2, lng2){
    var PI = 3.1415926;
    var EarthRadius = 6378137;
    var Rad = PI / 180.0;
    var radlat1 = lat1 * Rad;
    var radlat2 = lat2 * Rad;
    var a = radlat1 - radlat2;
    var b = (lng1 - lng2)*Rad;
    var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2)+Math.cos(radlat1)*Math.cos(radlat2)*Math.pow(Math.sin(b/2),2)));
    s = s*EarthRadius;
    s = Math.round(s * 100) / 100;
    return s;
}

/**
 *  睡眠函数
 *  @param numberMillis -- 要睡眠的毫秒数
 */
 function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}
  
  

//通过经纬度解析详细地址
const getAddress = (lng, lat) => {
    // 创建地理编码实例      
    var myGeo = new window.BMapGL.Geocoder();      
    // 根据坐标得到地址描述    
    myGeo.getLocation(new window.BMapGL.Point(lng, lat), function(result){      
        if (result){      
            return result.address    
        }      
    });
    return ""
}

/**
 * @param point 原点
 * @param radius 半径 米
 * @param SRadian 开始弧度
 * @param ERadian 结束弧度
 * */
function sector(map, point, radius, SRadian, ERadian) {
    //
    var points = [] // 创建构成多边形的点数组
    points.push(point) // 起点
    // 根据弧度 计算扇形点 分布
    var step = (ERadian - SRadian) / 15 || 15

    for (var i = SRadian; i < ERadian + 0.001; i += step) {
        // 循环 获取 圆弧上点的坐标
        points.push(EOffsetBearing(map, point, radius, i))
    }
    // 连接起点
    points.push(point)
    return points
}

/**
 * @param point 原点
 * @param dist 半径
 * @param bearing 计数
 * */
function EOffsetBearing(map, point, dist, bearing) {
    // 计算1经度与原点的距离
    var lngConv = map.getDistance(point, new window.BMapGL.Point(point.lng + 0.1, point.lat)) * 10
    // 计算1纬度与原点的距离
    var latConv = map.getDistance(point, new window.BMapGL.Point(point.lng, point.lat + 0.1)) * 10
    // 正弦计算待获取的点的纬度与原点纬度差
    var lat = (dist * Math.sin((bearing * Math.PI) / 180)) / latConv
    // 余弦计算待获取的点的经度与原点经度差
    var lng = (dist * Math.cos((bearing * Math.PI) / 180)) / lngConv
    return new window.BMapGL.Point(point.lng + lng, point.lat + lat)
}


/**
 * 创建一个扇形
 * @param sector_point 圆点
 * @param radius 半径 单位:米
 * @param angle_1 中心轴与正北顺时针夹角
 * @param angle_2 扇形张度
 * 
 * */
function draw_sector (map, sector_point, radius, angle_1, angle_2, color, opacity) {
    let base_north_leftRadian = angle_1 + angle_2 / 2 // 右边界与正北夹角
    let base_north_rightRadian = angle_1 - angle_2 / 2 // 左边界与正北夹角

    // sector计算与正东逆时针夹角，转换一下
    let base_east_leftRadian = 360 - base_north_leftRadian + 90
    let base_east_rightRadian = 360 - base_north_rightRadian + 90

    //console.log(base_east_leftRadian, base_east_rightRadian)

    // 圆点
    let point = new window.BMapGL.Point(sector_point.lng, sector_point.lat)
    // 获取扇形曲线边上的点集合
    let points = sector(map, point, radius, base_east_leftRadian, base_east_rightRadian)
    //console.log(points)
    let oval = new window.BMapGL.Polygon(points, {
        strokeColor: color, // 边线颜色
        strokeWeight: 1, // 边线的宽度，以像素为单位
        strokeOpacity: 0.5, // 边线透明度，取值范围0 - 1
        fillColor: color, // 填充颜色
        fillOpacity: opacity
    })
    //map.addOverlay(oval)
    //oval.enableDragging()
    // // 文本内容
    // var text = temPoi[4]
    // onClick(text, oval) // 调鼠标用点击事件
    // onMouseover(oval)
    // onMouseout(oval)
    return {sector: oval, points: points}
}

/**
     * 在百度地图上给绘制的直线添加箭头
     * @param polyline 直线 var line = new BMap.Polyline([faydPoint,daohdPoint], {strokeColor:"blue", strokeWeight:3, strokeOpacity:0.5});
     * @param length 箭头线的长度 一般是10
     * @param angleValue 箭头与直线之间的角度 一般是Math.PI/7
     */
 function addArrow(map, polyline, length, angleValue, color, size, opacity){ //绘制箭头的函数
    //console.log(polyline)
    var linePoint = polyline.getPath();//线的坐标串
    var arrowCount = linePoint.length;
    for(var i = 1 ; i < arrowCount; i++){ //在拐点处绘制箭头
        var pixelStart=map.pointToPixel(linePoint[i-1]);
        var pixelEnd=map.pointToPixel(linePoint[i]);
        var angle=angleValue;//箭头和主线的夹角
        var r=length; // r/Math.sin(angle)代表箭头长度
        var delta=0; //主线斜率，垂直时无斜率
        var param=0; //代码简洁考虑
        var pixelTemX,pixelTemY;//临时点坐标
        var pixelX,pixelY,pixelX1,pixelY1;//箭头两个点
        if(pixelEnd.x-pixelStart.x==0){ //垂直，斜率不存在是时
            pixelTemX=pixelEnd.x;
            if(pixelEnd.y>pixelStart.y)
            {
            pixelTemY=pixelEnd.y-r;
            }
            else
            {
            pixelTemY=pixelEnd.y+r;
            }    
            //已知直角三角形两个点坐标及其中一个角，求另外一个点坐标算法
            pixelX=pixelTemX-r*Math.tan(angle); 
            pixelX1=pixelTemX+r*Math.tan(angle);
            pixelY=pixelY1=pixelTemY;
        }
        else  //斜率存在时
        {
            delta=(pixelEnd.y-pixelStart.y)/(pixelEnd.x-pixelStart.x);
            param=Math.sqrt(delta*delta+1);

            if((pixelEnd.x-pixelStart.x)<0) //第二、三象限
            {
            pixelTemX=pixelEnd.x+ r/param;
            pixelTemY=pixelEnd.y+delta*r/param;
            }
            else//第一、四象限
            {
            pixelTemX=pixelEnd.x- r/param;
            pixelTemY=pixelEnd.y-delta*r/param;
            }
            //已知直角三角形两个点坐标及其中一个角，求另外一个点坐标算法
            pixelX=pixelTemX+ Math.tan(angle)*r*delta/param;
            pixelY=pixelTemY-Math.tan(angle)*r/param;

            pixelX1=pixelTemX- Math.tan(angle)*r*delta/param;
            pixelY1=pixelTemY+Math.tan(angle)*r/param;
        }

        var pointArrow=map.pixelToPoint(new window.BMapGL.Pixel(pixelX,pixelY));
        var pointArrow1=map.pixelToPoint(new window.BMapGL.Pixel(pixelX1,pixelY1));
        var Arrow = new window.BMapGL.Polyline([
            pointArrow,
            linePoint[i],
            pointArrow1
        ], {strokeColor: color, strokeWeight:size, strokeOpacity: opacity});
        //map.addOverlay(Arrow);
        return Arrow;
    }
}

/**
 * 绘制箭头
 * @param map 地图对象
 * @param bd_start_point 百度坐标系下的直线起点
 * @param bd_end_point 百度坐标系下的直线终点
 * @param color 箭头颜色
 * @param size 线条粗细
 * @param opacity 透明度
 * */
function draw_arrow(map, bd_start_point, bd_end_point, size, color, opacity) {
    let polyline = new window.BMapGL.Polyline([
        new window.BMapGL.Point(bd_start_point.lng, bd_start_point.lat),
        new window.BMapGL.Point(bd_end_point.lng, bd_end_point.lat)
    ], {strokeColor: color, strokeWeight:size, strokeOpacity:opacity * 3});
    let arrow = addArrow(map, polyline, 10, Math.PI/7, color, size , opacity * 3)
    return [polyline, arrow]
}

/**
 * 绘制箭头
 * @param bd_location 百度坐标点
 * @param size svg图片尺寸
 * @param icon 图片对象
 * @param data 携带在marker上的展示数据
 * @param angle 图片旋转角度 以正北顺时针
 * */
function draw_svg(bd_location, icon, size, data, angle){
    // 数据中存储的坐标为wgs坐标，需要转换为bd坐标，渲染在百度地图
    //console.log('转换前wgs坐标: ', point.lng, point.lat)
    //const bd_location = wgs_to_bd(point.lng, point.lat)
    //console.log('转换后bd坐标: ', bd_point.lng, bd_point.lat)
    let point = new window.BMapGL.Point(bd_location.lng, bd_location.lat);  // 创建点坐标 
    let myIcon = new window.BMapGL.Icon(icon, new window.BMapGL.Size(size, size), { anchor: new window.BMapGL.Size(0, 0) });
    
    const title = data.id + ':' + data.name + ',经度:' + data.lng + ',纬度:' + data.lat + ',角度:' + data.angle

    let marker = new window.BMapGL.Marker(point, { title: title, icon: myIcon, enableDragging: true, enableClicking: true, draggingCursor: 'move' });
    marker.setRotation(angle - 90)
    // 点击事件
    //marker.addEventListener('click', (e) => { this.updateBottomInfo(e) });
    // 覆盖物拖拽开始事件
    //marker.addEventListener('dragstart', (e) => { this.updateBottomInfo(e) });
    // 覆盖物拖拽事件
    //marker.addEventListener('dragend', (e) => { this.endDragMarker(e) });
    return [marker]
}


/**
 * 绘制扇形和箭头
 * @param map 地图对象
 * @param bd_point 扇形圆点
 * @param radius 半径 单位:米
 * @param angle_1 中心轴与正北顺时针夹角
 * @param angle_2 扇形张度
 * @param sector_color 扇形颜色
 * @param arrow_color 箭头颜色
 * @param opacity 透明度
 * */
 function draw_arrow_and_sector(map, bd_point, radius, angle_1, angle_2, sector_color, arrow_color, opacity) {
    let {sector} = draw_sector (map, bd_point, radius, angle_1, angle_2, sector_color, opacity)
    let start_point = new window.BMapGL.Point(bd_point.lng, bd_point.lat)
    let end_point = EOffsetBearing(map, start_point, radius, 360 - angle_1 + 90)
    let arrow_size = radius > 100 ? radius/1000 : 1
    let arrow = draw_arrow(map, {lng: start_point.lng, lat: start_point.lat}, {lng: end_point.lng, lat: end_point.lat}, arrow_size, arrow_color, 0.5)
    return [sector, arrow[0], arrow[1]]
}

//度  ->  度°分′秒″
function ToDegrees(val) {
    if (typeof (val) == "undefined" || val == "") {
        return "";
    }
    val = val + ""
    var i = val.indexOf('.');
    var strDu = i < 0 ? val : val.substring(0, i);//获取度
    var strFen = 0;
    var strMiao = 0;
    if (i > 0) {
        var strFen = "0" + val.substring(i);
        strFen = strFen * 60 + "";
        i = strFen.indexOf('.');
        if (i > 0) {
            strMiao = "0" + strFen.substring(i);
            strFen = strFen.substring(0, i);//获取分
            strMiao = strMiao * 60 + "";
            i = strMiao.indexOf('.');
            console.log(strMiao)
            //strMiao = strMiao.substring(0, i + 4);//取到小数点后面三位
            //console.log(strMiao)
            //strMiao = parseFloat(strMiao).toFixed(2);//精确小数点后面两位
        }
    }
    return strDu + "," + strFen + "," + strMiao;
}

//度°分′秒″  ->  度
function ToDigital(strDu, strFen, strMiao, len) {
    len = (len > 6 || typeof (len) == "undefined") ? len : 6;//精确到小数点后最多六位   
    strDu = (typeof (strDu) == "undefined" || strDu == "") ? 0 : parseFloat(strDu);
    strFen = (typeof (strFen) == "undefined" || strFen == "") ? 0 : parseFloat(strFen) / 60;
    strMiao = (typeof (strMiao) == "undefined" || strMiao == "") ? 0 : parseFloat(strMiao) / 3600;
    var digital = strDu + strFen + strMiao;

    if (digital == 0) {
        return "";
    } else {
        return digital.toFixed(len);
    }
}



module.exports = {
    bd_decrypt_To_gcj : bd_decrypt_To_gcj ,
    gcj_decrypt_To_wgs : gcj_decrypt_To_wgs ,
    getDistance: getDistance,
    getAddress: getAddress,
    bd_to_wgs: bd_to_wgs,
    wgs_to_bd: wgs_to_bd,
    ToDigital: ToDigital,
    ToDegrees: ToDegrees,
    draw_sector: draw_sector,
    draw_svg: draw_svg,
    draw_arrow: draw_arrow,
    draw_arrow_and_sector: draw_arrow_and_sector
}


