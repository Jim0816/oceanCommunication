import React, { Component } from 'react'

import { Checkbox, Form, message, Input, InputNumber, Button, Alert, Spin, FormInstance } from 'antd';
import { CloudSyncOutlined } from '@ant-design/icons';
import triangle from '../../asserts/photo/arrow_black.png'
import acceptor from '../../asserts/photo/arrow_red.png'
import rador from '../../asserts/photo/rador2.png'
import location from '../../asserts/photo/location.png'
import location_select from '../../asserts/photo/location_select.png'
import launch from './index.module.css'
import store from '../../store/index';

import { add, getList } from '../../api/launch'
import { get_date_detail, getLocalDateTime } from '../../utils/dateUtil'
import { getAddress, bd_to_wgs, wgs_to_bd, draw_sector, draw_svg, draw_arrow , draw_arrow_and_sector} from '../../utils/mapUtil'

const center_point = {lng: 109.1110623255866, lat: 21.02762360632489}
// angle_1代表箭头的正北顺时针夹角，angle_2代表扇形夹角
const data = [
  {id: 1, name: '发射机A', type:'svg', show: false, icon: rador, lng: 109.1010623255866, lat: 21.01162360632489, time: '', location: '', angle: 0, size: 100},
  {id: 2, name: '接收机B', type:'sector_arror', angle_1: 0, angle_2: 180, radius: 300, color: 'red', show: false, icon: acceptor, lng: 109.0810623255866, lat: 21.01162360632489, time: '', location: '', size: 50},
  {id: 3, name: '接收天线B1', type:'sector_arror', angle_1: 30, angle_2: 80, radius: 300, color: 'blue', show: false, icon: triangle, lng: 109.0610623255866, lat: 21.01162360632489, time: '', location: '', size: 50},
  {id: 4, name: '接收天线B2', type:'sector_arror', angle_1: 90, angle_2: 90, radius: 300, color: 'blue', show: false, icon: triangle, lng: 109.0610623255866, lat: 21.00162360632489, time: '', location: '', size: 50},
  {id: 5, name: '接收天线B3', type:'sector_arror', angle_1: 120, angle_2: 120, radius: 300, color: 'blue', show: false, icon: triangle, lng: 109.0810623255866, lat: 21.00162360632489, time: '', location: '', size: 50}
]


const res_test_data = [
    {
        "_id": 1,
        "filename": "实时数据_20202002020202",
        "time": "2022:0601 13:00:00",
        "content": []
    },
    {
        "_id": 2,
        "filename": "实时数据_20202002020202",
        "time": "2022:0601 13:00:00",
        "content": []
    }
]

// function distance () {
//     var PI = 3.1415926;
//     var EarthRadius = 6378137;
//     var Rad = PI / 180.0;
//     var radlat1 = lat1 * Rad;
//     var radlat2 = lat2 * Rad;
//     var a = radlat1 - radlat2;
//     var b = (lng1 - lng2) * Rad;
//     var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.pow(Math.sin(b / 2), 2)));
//     s = s * EarthRadius;
//     s = Math.round(s * 100) / 100;
//     return s;
// }



export default class index extends Component {
    formRef = React.createRef();
    state = {
        location: {},
        list: [], //文件列表
        select: -1, // 选择的文件id
        map: {}, // 地图对象引用
        markers: [], // 页面暂存对象集合
        showList: false,
        loading_index: -1,
        marker_objs: {}, // key: id, value: marker数组[即构成一个图形的所有marker对象]
        editObj: {
            id: "",
            name: "",
            lng: "",
            lat: "",
            angle_1: "",//angle_1代表箭头的正北顺时针夹角，angle_2代表扇形夹角
            angle_2: "",//angle_2代表扇形夹角
            time: "",
            location: ""
        }, //暂存marker编辑信息的临时对象
    }

    render() {
        let { editObj, markers, list, select, loading_index,} = this.state
        const tailLayout = {
            wrapperCol: {
              offset: 8,
              span: 16,
            },
        };
        //let height = this.adjustCenterSize()
        //console.log(height)
        return (
            <div className={launch.container}>
                <div className={launch.top}>
                    {
                        markers.map((marker, index) => {
                            return (
                                <Checkbox id={index + 1} key={index} style={{ "marginTop": 15, "marginLeft": 20, "fontWeight": "bolder" }} checked={marker.show} onChange={this.onChangeCheck}>{marker.name}</Checkbox>
                            )
                        })
                    }
                </div>

                {/* 地图层 */}
                <div id='center' className={launch.center}>
                    <div style={{ 'position': 'relative', 'width': '100%', 'height': '100%' }}>
                        {/* 编辑marker的位置状态信息 */}
                        <div className={launch.loading} style={{ 'zIndex': loading_index }}>
                            <div className={launch.loading_top}>{editObj.name}</div>
                            <div className={launch.loading_center}>
                                <Form
                                    name="basic"
                                    labelCol={{
                                    span: 5,
                                    }}
                                    wrapperCol={{
                                    span: 16,
                                    }}
                                    style={{
                                    maxWidth: 600,
                                    }}
                                    initialValues={{
                                    remember: true,
                                    }}
                                    ref={this.formRef}
                                    onFinish={this.onFinish}
                                    autoComplete="off"
                                >
                                    <Form.Item
                                        label="经度"
                                        name="lng"
                                        rules={[
                                            {
                                            required: true,
                                            message: '请输入当前位置的经度!',
                                            },
                                        ]}
                                        >
                                        <InputNumber
                                            style={{
                                            width: 280,
                                            }}
                                            min="0"
                                            max="300"
                                            step="0.00000000001"
                                            value={editObj.lng}
                                            stringMode
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="纬度"
                                        name="lat"
                                        rules={[
                                            {
                                            required: true,
                                            message: '请输入当前位置的纬度!',
                                            },
                                        ]}
                                        >
                                        <InputNumber
                                            style={{
                                            width: 280,
                                            }}
                                            min="0"
                                            max="300"
                                            step="0.00000000001"
                                            value={editObj.lat}
                                            stringMode
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="角度"
                                        name="angle"
                                        rules={[
                                            {
                                            required: true,
                                            message: '请输入正北顺时针方向夹角！',
                                            },
                                        ]}
                                        >
                                        <InputNumber
                                            style={{
                                            width: 280,
                                            }}
                                            min="0"
                                            max="360"
                                            step="1"
                                            value={editObj.angle}
                                            stringMode
                                        />
                                    </Form.Item>
                                    <Form.Item {...tailLayout}>
                                        <Button type="primary" htmlType="submit">确认</Button>
                                        <Button htmlType="button" onClick={this.onReset}>返回</Button>
                                    </Form.Item>

                                </Form>
                            </div>
                            {/* <div className={launch.loading_bottom}>
                                <Button type="primary" onClick={this.cancelmMarker}>返回</Button>
                                <Button type="primary" onClick={this.confirmMarker}>确认</Button>
                            </div> */}
                        </div>

                        <div id='map' className={launch.map}></div>
                        <div className={launch.showListBtn} onClick={this.open_show_list}>></div>
                        {this.state.showList ?
                            (<div className={launch.showList}>
                                <div className={launch.showList_close} onClick={this.close_show_list}>关闭</div>
                                {
                                    list.map((file, index) => {
                                        return (
                                            <div key={index} className={launch.showList_item} onClick={(e) => { this.click_file(file._id, e) }}>
                                                <span className={launch.showList_item_left}><img style={{ 'width': '100%', 'height': '100%' }} src={file._id.toString() === select ? location_select : location} /></span>
                                                <span className={launch.showList_item_right} style={file._id.toString() === select ? { 'color': '#1296db' } : { 'color': 'white' }}>
                                                    <label style={{ 'cursor': 'pointer' }}>名称：{file.filename}</label>
                                                    <br />
                                                    <label style={{ 'cursor': 'pointer' }}>时间：{file.time}</label>
                                                </span>
                                            </div>
                                        )
                                    })
                                }
                            </div>) : null
                        }

                        <div className={launch.infoWindow}>
                            <label style={{lineHeight: '40px', color: 'white', fontSize: '18px', fontWeight: 'bold'}}>接收距离</label>
                            <label style={{lineHeight: '24px', color: 'white', fontSize: '15px'}}>A-B1: 1930m</label>
                            <label style={{lineHeight: '24px', color: 'white', fontSize: '15px'}}>A-B2: 2500m</label>
                            <label style={{lineHeight: '24px', color: 'white', fontSize: '15px'}}>A-B3: 670m</label>
                            <label style={{lineHeight: '24px', color: 'white', fontSize: '15px'}}>B1-B2: 1000m</label>
                            <label style={{lineHeight: '24px', color: 'white', fontSize: '15px'}}>B2-B3: 2943m</label>
                        </div>
                    </div>
                </div>


                <div className={launch.bottom}>
                    <Button type="primary" icon={<CloudSyncOutlined />} style={{ backgroundColor: "#428bca", marginTop: 10, marginLeft: 15 }} onClick={this.submitChange}>上传记录</Button>
                    <div className={launch.bottomContent}>
                        {
                            editObj.id != '' ? (
                                <span className={launch.bottomContentSpan} style={{ fontSize: '14px', lineHeight: '45px', color: 'gray'}}>
                                        <label style={{color: 'black', fontWeight: 'bold'}}>{editObj.name}:</label>
                                        <label>坐标(BD系列):[{editObj.lng}, {editObj.lat}]</label>
                                        <label>箭头角度(正北顺时针):{editObj.angle_1}°</label>
                                        <label>扇形角度(正北顺时针):{editObj.angle_2}°</label>
                                        {/* <label>地址:广西壮族自治区北海市北部湾海域中部</label> */}
                                </span>
                            ) : null
                        }
                    </div>
                </div>
            </div>
        )
    }

    async componentDidMount() {
        var page_state = this.state
        var that = this
        //this.adjustCenterSize()

        // 初始化数据
        // await getList().then(
        //     res => {
        //         console.log(res)
        //         // 里面的坐标为wgs坐标，渲染时再转换
        //         this.state.list = res
        //     }
        // ).catch(
        //     err => {
        //         message.error('数据加载失败')
        //         console.log(err)
        //     }
        // )
        this.state.list = res_test_data
        // 附近默认坐标点
        this.state.markers = data

        document.addEventListener('contextmenu', this._handleContextMenu);
        

        // 初始化地图
        const map = new window.BMapGL.Map("map");// 创建地图实例 
        var point = new window.BMapGL.Point(center_point.lng, center_point.lat);  //  默认
        map.centerAndZoom(point, 14);
        // 定位修改
        // var geolocation = new window.BMapGL.Geolocation();
        // geolocation.getCurrentPosition(function (r) {
        //     if (this.getStatus() == 0) {
        //         map.setCenter(new window.BMapGL.Point(r.longitude, r.latitude))
        //         // 初始化默认marker
        //         let markers = []
        //         for (let i = 0; i < data.length; i++) {
        //             let item = JSON.parse(JSON.stringify(data[i]))
        //             let wgs_location = bd_to_wgs(r.longitude, r.latitude)
        //             item.lng = wgs_location.lng
        //             item.lat = wgs_location.lat
        //             item.location = r.address.province + r.address.city + r.address.country
        //             markers.push(item)
        //         }
        //         page_state.markers = markers
        //         page_state.loading_index = -1
        //         that.forceUpdate()
        //     } else {
        //         console.log('获取位置失败....')
        //     }
        // });
        //map.disableDragging()
        map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
        var scaleCtrl = new window.BMapGL.ScaleControl();  // 添加比例尺控件
        map.addControl(scaleCtrl);
        var zoomCtrl = new window.BMapGL.ZoomControl();  // 添加缩放控件
        map.addControl(zoomCtrl);


        // 初始化所有marker
        //this.init_markers(map)

        var copyrights = document.getElementsByClassName(' BMap_cpyCtrl anchorBL');
        if (copyrights.length > 0) {
            copyrights[0].style.display = 'none'
        }

        this.state.map = map
        this.forceUpdate()
    }

    componentWillUnmount() {
        document.removeEventListener('contextmenu', this._handleContextMenu);
    }


    _handleContextMenu = (event) => {
        event.preventDefault();
        this.state.showList = true
        this.forceUpdate()
    }


    open_show_list = () => {
        this.state.showList = true
        this.forceUpdate()
    }
    close_show_list = () => {
        this.state.showList = false
        this.forceUpdate()
    }

    

    // 获取选择的文件内容
    click_file = (id, event) => {
        let { list, markers, map } = this.state
        let new_markers

        //先清空前面marker
        map.clearOverlays()

        // 更新缓存中markers
        for (let i = 0; i < list.length; i++) {
            let cur_id = (list[i]._id).toString()
            if (id.toString() === cur_id) {
                new_markers = list[i].content
                break
            }
        }
        // 格式化markers 便于适配交互
        for (let i = 0; i < markers.length; i++) {
            //markers[i] = {id: 1, name: '发射机A', show: false, icon: rador, lng: 109.91339017089847, lat: 21.085693492605827, time: '', location: '', angle: 0, size: 100}
            new_markers[i]['show'] = true
            new_markers[i]['icon'] = markers[i].name.indexOf('发射') != -1 ? rador : (markers[i].name.indexOf('接收机') != -1 ? acceptor : triangle)
            new_markers[i]['size'] = markers[i].name.indexOf('发射') != -1 ? 100 : 50
            new_markers[i]['time'] = ''
            new_markers[i]['location'] = ''
        }
        // 修改select、修改当前页面缓存
        this.setState({
            select: id,
            markers: new_markers
        }, () => {
            // 地图上渲染新marker
            // 调整地图中心位置
            let bd_location = wgs_to_bd(new_markers[0].lng, new_markers[0].lat)
            map.setCenter(new window.BMapGL.Point(bd_location.lng, bd_location.lat))
            for (let i = 0; i < new_markers.length; i++) {
                this.showMarker(new_markers[i].id)
            }
        })
        // 将当前页面缓存更新到全局域
        store.dispatch({ type: 'markers', new_markers })
    }

    init_markers = (map) => {
        let { markers } = this.state
        for (let i = 0; i < markers.length; i++) {
            let item = markers[i]
            if (item.show) {
                let photo = this.draw(item)
                photo.forEach(function(e) {
                    map.addOverlay(e)
                });
            }
        }
        store.dispatch({ type: 'markers', markers })
    }

    
    onChangeCheck = (e) => {
        let { markers } = this.state
        let id = e.target.id
        let show = e.target.checked
        if (show) {
            this.showMarker(id)
        } else {
            this.removeMarker(id)
        }

        for (let i = 0; i < markers.length; i++) {
            if (markers[i].id === id) {
                markers[i].show = show
                break
            }
        }

        this.state.markers = markers
        this.forceUpdate()
    }

    // 在地图上显示marker，不修改数据
    showMarker = (id) => {
        let { markers, map } = this.state
        // 更新地图上的角度显示效果
        for (let i = 0; i < markers.length; i++) {
            let item = markers[i]
            if (item.id === id) {
                //console.log(item)
                //let marker = null
                // 数据中存储的坐标为wgs坐标，需要转换为bd坐标，渲染在百度地图
                //const bd_location = wgs_to_bd(point.lng, point.lat)
                //let marker = draw_svg(bd_location, icon, size, data, angle)
                //console.log(item)
                //let point = {lng: 111.283641, lat: 30.697694}
                //let marker = draw_sector(map, point, 3000, 90, 180)
                //let marker = this.draw(item)
                //console.log(marker)111.280364,30.717627   111.305409,30.72216
                //let arr = draw_arrow_and_sector(map, {lng: 111.280364, lat: 30.717627}, 3000, 90, 90, 'red', 'blue', 0.4)
                //let arr = draw_arrow(map, {lng: 111.280364, lat: 30.717627}, {lng: 111.305409, lat: 30.72216}, 5, 'red', 0.7)
                //map.addOverlay(arr[0]);
                //map.addOverlay(arr[1]);
                //map.addOverlay(arr[2]);
                // 绘制一类图形可能会返回多个marker元素
                let photo = this.draw(item)
                photo.forEach(function(e) {
                    map.addOverlay(e)
                });

                // 绑定事件
                let mainMarker = photo[0] // 一个图形可能由多个marker组成，此处默认选择第一个作为绑定对象
                let key = item.name + "_" + id
                mainMarker["key"] = key
                console.log(mainMarker)
                mainMarker.addEventListener("click", this.selectMarker); // 点击marker后，设置为当前操作对象，然后等待地图选点更新位置

                this.state.marker_objs[id] = photo
                return false;
            }
        }
    }


    // 恢复拖拽前位置
    onReset = () => {
        this.state.loading_index = -1
        let {editObj, map, markers} = this.state
        let theMarker = {}
        for (let i = 0 ; i < markers.length ; i++){
            if (markers[i].id == editObj.id){
                theMarker = markers[i]
                break
            }
        }

        this.state.editObj.lng = theMarker.lng
        this.state.editObj.lat = theMarker.lat
        this.state.editObj.angle_1 = theMarker.angle_1
        this.state.editObj.angle_2 = theMarker.angle_2
        this.forceUpdate()
    }

    onFinish = (values) => {
        console.log('Success:', values);
        this.state.loading_index = -1
        this.forceUpdate()
    };

    // 点击绑定操作对象，右下方显示当前操作对象信息
    selectMarker = (event) => {
        let {markers, map} = this.state
        let clickKey = event.currentTarget.key
        let arr = clickKey.split("_")
        let title = arr[0]
        let id = arr[1]
        this.state.editObj.name = title
        this.state.editObj.id = id
        let theMarker = {}
        for (let i = 0 ; i < markers.length ; i++){
            if (markers[i].id == id){
                theMarker = markers[i]
                break
            }
        }

        this.state.editObj.lng = theMarker.lng
        this.state.editObj.lat = theMarker.lat
        this.state.editObj.angle_1 = theMarker.angle_1
        this.state.editObj.angle_2 = theMarker.angle_2
        map.setDefaultCursor("crosshair");

        // 开始监听鼠标移动

        // 选择所要操作的marker之后，将要监听用户下次点击的位置
        map.addEventListener('mousemove', this.moveMarkerLocation);
        map.addEventListener('dblclick', this.endMoveMarkerLocation);
        this.forceUpdate()
    }

    // 用户在选定操作对象后，点击某个位置，marker将移动到该位置
    moveMarkerLocation = (e) => {
        //console.log('当前位置经纬度：' + e.latlng.lng + ',' + e.latlng.lat);
        let {editObj} = this.state
        editObj.lng = e.latlng.lng
        editObj.lat = e.latlng.lat
        this.forceUpdate()
    }

    endMoveMarkerLocation = (e) => {
        let {map} = this.state
        console.log('用户双击选择当前位置，结束鼠标移动监听事件')
        map.setDefaultCursor("default");
        map.removeEventListener('mousemove', this.moveMarkerLocation);
        this.state.loading_index = 5
        this.forceUpdate()
    }


    // 拖拽结束，跳出编辑marker页面
    editMarker = (event) => {
        let {markers} = this.state
        let clickKey = event.currentTarget.key
        let arr = clickKey.split("_")
        let title = arr[0]
        let id = arr[1]
        this.state.editObj.name = title
        this.state.editObj.id = id
        this.state.loading_index = 5
        let theMarker = {}
        for (let i = 0 ; i < markers.length ; i++){
            if (markers[i].id == id){
                theMarker = markers[i]
                break
            }
        }

        this.formRef.current.setFieldsValue({
            lng: event.latLng.lng,//拖拽结束时的经度
            lat: event.latLng.lat,//拖拽结束时的纬度
            angle: theMarker.angle
        });

        this.forceUpdate()
    }

    // 绘制图形 [注意：传入绘制的坐标必须为百度坐标系]
    draw = (item) => {
        let {map } = this.state
        var markers = []
        var type = item.type
        // 数据中存储的坐标为wgs坐标，需要转换为bd坐标，渲染在百度地图
        var bd_location = wgs_to_bd(item.lng, item.lat)
        console.log(bd_location)

        switch (type){
            case 'sector':
                // 测试通过【暂时用不到】
                markers = draw_sector(map, item.point, 3000, 90, 180)
                break;
            case 'arror':
                // 绘制箭头 [测试通过,暂时用不到]
                //markers = draw_arrow(map, {lng: bd_location.lng, lat: bd_location.lat}, {lng: 111.305409, lat: 30.72216}, 5, 'red', 0.7)
                break;
            case 'sector_arror':
                // 绘制扇形和箭头组合图形 [测试通过] 以正北顺时针为标准，angle_1：箭头夹角，angle_2：扇形夹角
                markers = draw_arrow_and_sector(map, {lng: bd_location.lng, lat: bd_location.lat}, item.radius, item.angle_1, item.angle_2, item.color, 'black', 0.15)
                break;
            case 'svg':
                // 绘制svg图 [测试通过]
                markers = draw_svg(bd_location, item.icon, item.size, item, item.angle)
                break;
            default:
                break;
        }
        return markers
    }


    // 在地图上移除，不修改数据
    removeMarker = (marker_id) => {
        let { map, marker_objs } = this.state
        let photo_markers = marker_objs[marker_id]
        // 1.先清楚地图上这个图形下的所有marker
        photo_markers.forEach(function(marker){
            map.removeOverlay(marker)
        })

        // 2.更新缓存映射数据
        marker_objs[marker_id] = []
        this.state.marker_objs = marker_objs
    }


    cancelmMarker = () => {
        this.state.loading_index = -1
        this.forceUpdate()
    }

    confirmMarker = () => {
        this.state.loading_index = -1
        this.forceUpdate()
    }

    // 点击同步按钮，更新数据
    // 注意：拖拽marker后，会在拖拽结束时将bd坐标转换为wgs坐标存入markers
    submitChange = () => {
        let { markers } = this.state
        // 此时markers内部的坐标全部为wgs坐标
        //console.log(markers)
        let data = this.formatData(markers)
        console.log('提交前数据: ', data)

        add(data).then(
            res => {
                if (res.result == 1) {
                    message.success("位置文件创建成功!")
                    store.dispatch({ type: 'markers', data })
                    // 刷新数据
                    getList().then(
                        res => {
                            this.state.list = res
                            if (res.length > 0) {
                                this.state.select = res[0]._id.toString()
                            }
                            this.forceUpdate()
                        }
                    ).catch(
                        err => {
                            message.error('数据加载失败')
                            console.log(err)
                        }
                    )
                }

            }
        ).catch(
            err => {
                message.error('操作失败')
                console.log(err)
            }
        )
    }

    // 格式化存储数据
    formatData = (markers) => {
        var data = []
        var time = getLocalDateTime()
        for (let i = 0; i < markers.length; i++) {
            let marker = markers[i]
            let item = {
                id: marker.id,
                name: marker.name,
                lng: marker.lng,
                lat: marker.lat,
                angle: marker.angle,
                time: time,
                location: marker.location
            }
            data.push(item)
        }
        return { data: data }
    }

    update_cur_marker_to_state = (marker) => {
        let { markers } = this.state
        for (let i = 0; i < markers.length; i++) {
            if (markers[i].id === marker.id) {
                let new_marker = JSON.parse(JSON.stringify(marker))
                console.log('转换前bd坐标:', marker.lng, marker.lat)
                let wgs_location = bd_to_wgs(marker.lng, marker.lat)
                console.log('转换后wgs坐标：', wgs_location.lng, wgs_location.lat)
                new_marker.lng = wgs_location.lng
                new_marker.lat = wgs_location.lat
                // 更新当前marker到markers
                markers[i] = new_marker
                break
            }
        }
        this.state.markers = markers
    }
}