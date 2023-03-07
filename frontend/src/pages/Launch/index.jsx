import React, { Component } from 'react'

import { Checkbox, Form, message, Input, InputNumber, Button} from 'antd';
import { CloudSyncOutlined, SwapOutlined} from '@ant-design/icons';
import triangle from '../../asserts/photo/arrow_black.png'
import acceptor from '../../asserts/photo/arrow_red.png'
import rador from '../../asserts/photo/rador2.png'
import location from '../../asserts/photo/location.png'
import location_select from '../../asserts/photo/location_select.png'
import launch from './index.module.css'
import store from '../../store/index';

import { add, getList } from '../../api/launch'
import { get_date_detail, getLocalDateTime } from '../../utils/dateUtil'
import { getDistance, bd_to_wgs, wgs_to_bd, ToDigital, ToDegrees, draw_sector, draw_svg, draw_arrow , draw_arrow_and_sector} from '../../utils/mapUtil'

const center_point = {lng: 109.111062, lat: 21.02762360632489}
// angle_1代表箭头的正北顺时针夹角，angle_2代表扇形夹角
const data = [
  {id: 1, name: '发射机A', code: 'a', type:'sector_arror', angle_1: 30, angle_2: 360, radius: 300, color: 'green', show: true, lng: 109.1010623255866, lat: 21.01162360632489, time: '', location: '', angle: 0, size: 100},
  {id: 2, name: '接收机B', code: 'b', type:'sector_arror', angle_1: 30, angle_2: 180, radius: 300, color: 'red', show: true, lng: 109.0810623255866, lat: 21.01162360632489, time: '', location: '', size: 50},
  {id: 3, name: '接收天线B1', code: 'b1', type:'sector_arror', angle_1: 30, angle_2: 80, radius: 300, color: 'blue', show: true, lng: 109.0610623255866, lat: 21.01162360632489,  time: '', location: '', size: 50},
  {id: 4, name: '接收天线B2', code: 'b2', type:'sector_arror', angle_1: 90, angle_2: 90, radius: 300, color: 'blue', show: true,  lng: 109.0610623255866, lat: 21.00162360632489, time: '', location: '', size: 50},
  {id: 5, name: '接收天线B3', code: 'b3', type:'sector_arror', angle_1: 120, angle_2: 120, radius: 300, color: 'blue', show: true,  lng: 109.0810623255866, lat: 21.00162360632489, time: '', location: '', size: 50}
]


const res_test_data = [
    {
        "_id": 1,
        "filename": "实时数据_20202002020202",
        "time": "2022:0601 13:00:00",
        "content": data
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
            code: "",
            name: "",
            lng: "",
            lat: "",
            angle_1: "",//angle_1代表箭头的正北顺时针夹角，angle_2代表扇形夹角
            angle_2: "",//angle_2代表扇形夹角
            time: "",
            location: ""
        }, //暂存marker编辑信息的临时对象
        distance: {
            'a-b1': 0,
            'a-b2': 0,
            'a-b3': 0,
            'b1-b2': 0,
            'b2-b3': 0
        },
        input_mode: 0, // 0表示经纬度坐标格式，1表示度分秒格式
    }

    render() {
        let { editObj, markers, list, select, loading_index, distance} = this.state
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
                            <div className={launch.loading_switch}>
                            <Button style={{float: 'right'}} type="primary" icon={<SwapOutlined />} size="small" onClick={this.switch_input_mode}>切换</Button>
                            </div>
                            

                            <div className={launch.loading_center}>
                                {this.state.input_mode == 1 ? (
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
                                        autoComplete="off">

                                        {/* 经度：度分秒输入格式 */}
                                        <Form.Item style={{marginLeft: '20px', height: '20px'}} label="位置经度">
                                            {/* 度 */}
                                            <Form.Item
                                                name="lng_du"
                                                help=""
                                                style={{
                                                    display: 'inline-block',
                                                    width: '60px',
                                                }}>
                                                <InputNumber
                                                    style={{
                                                    width: 60,
                                                    }}
                                                    min="0"
                                                    max="360"
                                                    step="1"
                                                    stringMode
                                                />
                                            </Form.Item>
                                            <span style={{display: 'inline-block', width: '20px', lineHeight: '32px', textAlign: 'center'}}>度</span>

                                            {/* 分 */}
                                            <Form.Item
                                                name="lng_fen"
                                                help=""
                                                style={{
                                                display: 'inline-block',
                                                width: '60px',
                                                }}>
                                                <InputNumber
                                                    style={{
                                                    width: 60,
                                                    }}
                                                    min="0"
                                                    max="360"
                                                    step="1"
                                                    stringMode/>
                                            </Form.Item>
                                            <span style={{display: 'inline-block', width: '20px', lineHeight: '32px', textAlign: 'center'}}>分</span>

                                            {/* 秒 */}
                                            <Form.Item
                                                name="lng_miao"
                                                help=""
                                                style={{
                                                display: 'inline-block',
                                                width: '60px',
                                                }}>
                                                <InputNumber
                                                    style={{
                                                    width: 60,
                                                    }}
                                                    min="0"
                                                    max="360"
                                                    step="1"
                                                    stringMode/>
                                            </Form.Item>
                                            <span style={{display: 'inline-block', width: '20px', lineHeight: '32px', textAlign: 'center'}}>秒</span>
                                        </Form.Item>

                                        {/* 纬度：度分秒输入格式 */}
                                        <Form.Item style={{marginLeft: '20px', height: '20px'}} label="位置经度">
                                            {/* 度 */}
                                            <Form.Item
                                                name="lat_du"
                                                help=""
                                                style={{
                                                    display: 'inline-block',
                                                    width: '60px',
                                                }}>
                                                <InputNumber
                                                    style={{
                                                    width: 60,
                                                    }}
                                                    min="0"
                                                    max="360"
                                                    step="1"
                                                    stringMode
                                                />
                                            </Form.Item>
                                            <span style={{display: 'inline-block', width: '20px', lineHeight: '32px', textAlign: 'center'}}>度</span>

                                            {/* 分 */}
                                            <Form.Item
                                                name="lat_fen"
                                                help=""
                                                style={{
                                                display: 'inline-block',
                                                width: '60px',
                                                }}>
                                                <InputNumber
                                                    style={{
                                                    width: 60,
                                                    }}
                                                    min="0"
                                                    max="360"
                                                    step="1"
                                                    stringMode/>
                                            </Form.Item>
                                            <span style={{display: 'inline-block', width: '20px', lineHeight: '32px', textAlign: 'center'}}>分</span>

                                            {/* 秒 */}
                                            <Form.Item
                                                name="lat_miao"
                                                help=""
                                                style={{
                                                display: 'inline-block',
                                                width: '60px',
                                                }}>
                                                <InputNumber
                                                    style={{
                                                    width: 60,
                                                    }}
                                                    min="0"
                                                    max="360"
                                                    step="1"
                                                    stringMode/>
                                            </Form.Item>
                                            <span style={{display: 'inline-block', width: '20px', lineHeight: '32px', textAlign: 'center'}}>秒</span>
                                        </Form.Item>

                                        {/*  箭头角度 */}
                                        <Form.Item
                                            style={{marginLeft: '20px', height: '20px'}}
                                            label="箭头角度"
                                            name="angle_1"
                                            rules={[
                                                {
                                                required: true,
                                                message: '请输入正北顺时针方向夹角！',
                                                },
                                            ]}
                                            >
                                            <InputNumber
                                                style={{width: 240,}}
                                                min="0"
                                                max="360"
                                                step="1"
                                                value={editObj.angle_1}
                                                stringMode
                                            />
                                        </Form.Item>

                                        {/*  扇形角度 */}
                                        <Form.Item
                                            style={{marginLeft: '20px', height: '20px'}}
                                            label="扇形角度"
                                            name="angle_2"
                                            rules={[
                                                {
                                                required: true,
                                                message: '请输入正北顺时针方向夹角！',
                                                },
                                            ]}
                                            >
                                            <InputNumber
                                                style={{
                                                width: 240,
                                                }}
                                                min="0"
                                                max="360"
                                                step="1"
                                                value={editObj.angle_2}
                                                stringMode
                                            />
                                        </Form.Item>

                                        {/*  底部按钮 */}
                                        <Form.Item {...tailLayout}>
                                            <Button type="primary" htmlType="submit">确认</Button>
                                            <Button htmlType="button" onClick={this.onReset}>返回</Button>
                                        </Form.Item>
                                    </Form>
                                ) : (
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
                                        autoComplete="off">
                                

                                        {/*  位置经度 */}
                                        <Form.Item
                                            style={{marginLeft: '20px', height: '20px'}}
                                            label="位置经度"
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
                                                width: 250,
                                                }}
                                                min="0"
                                                max="300"
                                                step="0.00000000001"
                                                value={editObj.lng}
                                                stringMode
                                            />
                                        </Form.Item>

                                        {/*  位置纬度 */}
                                        <Form.Item
                                            style={{marginLeft: '20px', height: '20px'}}
                                            label="位置纬度"
                                            name="lat"
                                            rules={[
                                                {
                                                required: true,
                                                message: '请输入当前位置的经度!',
                                                },
                                            ]}
                                            >
                                            <InputNumber
                                                style={{
                                                width: 250,
                                                }}
                                                min="0"
                                                max="300"
                                                step="0.00000000001"
                                                value={editObj.lat}
                                                stringMode
                                            />
                                        </Form.Item>

                                        {/*  箭头角度 */}
                                        <Form.Item
                                            style={{marginLeft: '20px', height: '20px'}}
                                            label="箭头角度"
                                            name="angle_1"
                                            rules={[
                                                {
                                                required: true,
                                                message: '请输入正北顺时针方向夹角！',
                                                },
                                            ]}
                                            >
                                            <InputNumber
                                                style={{width: 240,}}
                                                min="0"
                                                max="360"
                                                step="1"
                                                value={editObj.angle_1}
                                                stringMode
                                            />
                                        </Form.Item>

                                        {/*  扇形角度 */}
                                        <Form.Item
                                            style={{marginLeft: '20px', height: '20px'}}
                                            label="扇形角度"
                                            name="angle_2"
                                            rules={[
                                                {
                                                required: true,
                                                message: '请输入正北顺时针方向夹角！',
                                                },
                                            ]}
                                            >
                                            <InputNumber
                                                style={{
                                                width: 240,
                                                }}
                                                min="0"
                                                max="360"
                                                step="1"
                                                value={editObj.angle_2}
                                                stringMode
                                            />
                                        </Form.Item>

                                        {/*  底部按钮 */}
                                        <Form.Item {...tailLayout}>
                                            <Button type="primary" htmlType="submit">确认</Button>
                                            <Button htmlType="button" onClick={this.onReset}>返回</Button>
                                        </Form.Item>
                                    </Form>
                                )
                                }
                            </div>
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
                            <label style={{lineHeight: '24px', color: 'white', fontSize: '15px'}}>A-B1: {distance['a-b1']}m</label>
                            <label style={{lineHeight: '24px', color: 'white', fontSize: '15px'}}>A-B2: {distance['a-b2']}m</label>
                            <label style={{lineHeight: '24px', color: 'white', fontSize: '15px'}}>A-B3: {distance['a-b3']}m</label>
                            <label style={{lineHeight: '24px', color: 'white', fontSize: '15px'}}>B1-B2: {distance['b1-b2']}m</label>
                            <label style={{lineHeight: '24px', color: 'white', fontSize: '15px'}}>B2-B3: {distance['b2-b3']}m</label>
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
       
        this.init_data()
        
        // 附近默认坐标点
        //this.state.markers = data
        //this.computeDistanceWhenStop()


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
        map.disableDoubleClickZoom(true)
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

        // 初始化显示所有marker
        // for (let i = 0 ; i < this.state.markers.length ; i++){
        //     this.showMarker(this.state.markers[i].id)
        // }
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

    // 初始化后端发过来的数据列表
    init_data = () => {
        // 初始化数据
        // await getList().then(
        //     res => {
        //         console.log(res)
        //         // 里面的坐标为wgs坐标
        //         this.state.list = res
        //     }
        // ).catch(
        //     err => {
        //         message.error('数据加载失败')
        //         console.log(err)
        //     }
        // )

        // 后端传过来wgs坐标，需要将坐标转换为百度系列
        console.log('转换前数据：', res_test_data)
        let formatedList = []
        for (let i = 0 ; i < res_test_data.length ; i++){
            let profile = JSON.parse(JSON.stringify(res_test_data[i])) // 深拷贝
            let markers = profile.content
            profile.content = this.format_markers_wgs_to_bd(markers)
            formatedList.push(profile)
        }
        console.log('转换后数据：', formatedList)
        this.state.list = formatedList
        this.forceUpdate()
    }

    // 将列表数据中的wgs坐标转换为百度坐标
    format_markers_wgs_to_bd = (markers) => {
        let new_markers = []
        // 遍历每一个坐标
        for (let j = 0 ; j < markers.length ; j++){
            let marker = JSON.parse(JSON.stringify(markers[j])) // 深拷贝
            let bd_location = wgs_to_bd(marker.lng, marker.lat)
            marker.lng = bd_location.lng
            marker.lat = bd_location.lat
            new_markers.push(marker)
        }
        return new_markers
    }

    // 获取选择的文件内容
    click_file = (id, event) => {
        let { list, map } = this.state

        //先清空前面marker
        map.clearOverlays()

        let new_markers = []
        // 更新缓存中markers
        for (let i = 0; i < list.length; i++) {
            let cur_id = (list[i]._id).toString()
            if (id.toString() === cur_id) {
                new_markers = list[i].content
                break
            }
        }

        // 修改select、修改当前页面缓存
        this.setState({
            select: id,
            markers: new_markers
        }, () => {
            // 地图上渲染新marker
            // 调整地图中心位置
            map.setCenter(new window.BMapGL.Point(new_markers[0].lng, new_markers[0].lat))
            for (let i = 0; i < new_markers.length; i++) {
                this.showMarker(new_markers[i].id)
            }
        })

        // 将当前页面缓存更新到全局域
        //store.dispatch({ type: 'markers', new_markers })
    }

    // 点击左上角check，显示或者删除marker
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
                //console.log(item)
                let photo = this.draw(item)
                photo.forEach(function(e) {
                    map.addOverlay(e)
                });

                //console.log(photo)
                if (photo != undefined && photo.length > 0){
                    // 绑定事件
                    let mainMarker = photo[0] // 一个图形可能由多个marker组成，此处默认选择第一个作为绑定对象
                    let key = item.name + "_" + id
                    mainMarker['key'] = key
                    //console.log(mainMarker)
                    mainMarker.addEventListener("click", this.selectMarker); // 点击marker后，设置为当前操作对象，然后等待地图选点更新位置

                    this.state.marker_objs[id] = photo
                }

                this.forceUpdate()
            }
        }
    }

    // 切换坐标的输入方式
    switch_input_mode = () => {
        let {input_mode} = this.state
        this.state.input_mode = input_mode == 0 ? 1 : 0
        this.forceUpdate()
    }


    // 恢复拖拽前位置状态信息
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

        // 更新距离[回到初始距离]
        this.computeDistanceWhenStop()
        this.forceUpdate()
    }

    // 用户点击确认后，更新前端缓存的当前marker状态信息（注意，还没有提交后台）
    onFinish = (values) => {
        this.state.loading_index = -1
        let {editObj, markers} = this.state
        // 寻找当前marker
        let index = -1
        for (let i = 0 ; i < markers.length ; i++){
            if (markers[i].id == editObj.id){
                index = i
                break
            }
        }

        if (index != -1){
            // 在缓存中更细当前marker信息

            let lng_dfm = ToDegrees(values.lng)
            let lat_dfm = ToDegrees(values.lat)

            let arr = lng_dfm.split(",")
            let lng = ToDigital(arr[0], arr[1], arr[2], 14)

            console.log(values.lng, lng_dfm, lng)

            editObj.lng = values.lng
            editObj.lat = values.lat
            editObj.angle_1 = values.angle_1
            editObj.angle_2 = values.angle_2

            markers[index].lng = Number(values.lng)
            markers[index].lat = Number(values.lat)
            markers[index].angle_1 = Number(values.angle_1)
            markers[index].angle_2 = Number(values.angle_2)
            
            // 修改完数据后，需要重新绘制该图形
            this.removeMarker(markers[index].id) // 先移除原来marker
            this.showMarker(markers[index].id) // 绘制新marker

            // 更新距离
            this.computeDistanceWhenStop()


        }else{
            // 没有找到当前marker
            console.log('缓存中不存在当前marker状态信息')
            return
        }
        console.log('更新后缓存：', markers)
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

        this.state.editObj.code = theMarker.code
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
        this.computeDistanceWhenMove()
        this.forceUpdate()
    }

    endMoveMarkerLocation = (e) => {
        let {map, editObj} = this.state
        console.log(map.getDefaultCursor())
        console.log('用户双击选择当前位置，结束鼠标移动监听事件')
        map.setDefaultCursor("default");
        map.removeEventListener('mousemove', this.moveMarkerLocation);
        this.state.loading_index = 5
        
        this.formRef.current.setFieldsValue({
            lng: editObj.lng,//拖拽结束时的经度
            lat: editObj.lat,//拖拽结束时的纬度
            angle_1: editObj.angle_1,
            angle_2: editObj.angle_2
        });

        this.forceUpdate()
    }

    // 计算五组坐标之间的实时距离【缓存数据确定时：初始化，编辑结束】
    computeDistanceWhenStop = () => {
        let { markers} = this.state
        let a, b1, b2, b3
        let ab1, ab2, ab3, b1b2, b2b3

        for (let i = 0 ; i < markers.length ; i ++){
            let code = markers[i].code
            if (code == 'a'){
                a =  markers[i]
            }else if (code == 'b1'){
                b1 =  markers[i]
            }else if (code == 'b2'){
                b2 =  markers[i]
            }else if (code == 'b3'){
                b3 =  markers[i]
            }
        }

        ab1 = getDistance( a.lat, a.lng, b1.lat, b1.lng)
        ab2 = getDistance( a.lat, a.lng, b2.lat, b2.lng)
        ab3 = getDistance( a.lat, a.lng, b3.lat, b3.lng)
        b1b2 = getDistance( b1.lat, b1.lng, b2.lat, b2.lng)
        b2b3 = getDistance( b2.lat, b2.lng, b3.lat, b3.lng)

        this.state.distance = {
            'a-b1': ab1,
            'a-b2': ab2,
            'a-b3': ab3,
            'b1-b2': b1b2,
            'b2-b3': b2b3
        }


    }

    // 计算五组坐标之间的实时距离【移动鼠标时】
    computeDistanceWhenMove = () => {
        let {editObj, markers} = this.state
        let a, b1, b2, b3
        let ab1, ab2, ab3, b1b2, b2b3

        for (let i = 0 ; i < markers.length ; i ++){
            let code = markers[i].code
            if (code == 'a'){
                a =  markers[i]
            }else if (code == 'b1'){
                b1 =  markers[i]
            }else if (code == 'b2'){
                b2 =  markers[i]
            }else if (code == 'b3'){
                b3 =  markers[i]
            }
        }

        switch (editObj.code){
            case 'a':
                // 移动发射机A
                ab1 = getDistance( editObj.lat, editObj.lng, b1.lat, b1.lng)
                ab2 = getDistance( editObj.lat, editObj.lng, b2.lat, b2.lng)
                ab3 = getDistance( editObj.lat, editObj.lng, b3.lat, b3.lng)
                this.state.distance = {
                    'a-b1': ab1,
                    'a-b2': ab2,
                    'a-b3': ab3,
                    'b1-b2': this.state.distance['b1b2'],
                    'b2-b3': this.state.distance['b2b3']
                }
                break;
            case 'b1':
                // 移动接收天线B1
                ab1 = getDistance( editObj.lat, editObj.lng, a.lat, a.lng)
                b1b2 = getDistance( editObj.lat, editObj.lng, b2.lat, b2.lng)
                this.state.distance = {
                    'a-b1': ab1,
                    'a-b2': this.state.distance['a-b2'],
                    'a-b3': this.state.distance['a-b3'],
                    'b1-b2': b1b2,
                    'b2-b3': this.state.distance['b2-b3']
                }
                break;
            case 'b2':
                // 移动接收天线B2
                ab2 = getDistance( editObj.lat, editObj.lng, a.lat, a.lng)
                b1b2 = getDistance( editObj.lat, editObj.lng, b1.lat, b1.lng)
                b2b3 = getDistance( editObj.lat, editObj.lng, b3.lat, b3.lng)
                this.state.distance = {
                    'a-b1': this.state.distance['a-b1'],
                    'a-b2': ab2,
                    'a-b3': this.state.distance['a-b3'],
                    'b1-b2': b1b2,
                    'b2-b3': b2b3
                }
                break;
            case 'b3':
                // 移动接收天线B3
                b2b3 = b2b3 = getDistance( editObj.lat, editObj.lng, b2.lat, b2.lng)
                this.state.distance = {
                    'a-b1': this.state.distance['a-b1'],
                    'a-b2': this.state.distance['a-b2'],
                    'a-b3': this.state.distance['a-b3'],
                    'b1-b2': this.state.distance['b1-b2'],
                    'b2-b3': b2b3
                }
                break;
            default:
                break;
        }

        //this.forceUpdate()
    }

    // 绘制图形 [注意：传入绘制的坐标必须为百度坐标系]
    draw = (item) => {
        let {map } = this.state
        var markers = []
        var type = item.type
        // 数据中存储的坐标为wgs坐标，需要转换为bd坐标，渲染在百度地图
        //var bd_location = wgs_to_bd(item.lng, item.lat)

        console.log(item)
        
        var bd_location = {lng: item.lng, lat: item.lat}

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
        //清理地图上这个marker下所有控件
        photo_markers.forEach(function(item){
            map.removeOverlay(item)
        })
    }

    // 点击同步按钮，更新数据
    // 注意：拖拽marker后，会在拖拽结束时将bd坐标转换为wgs坐标存入markers
    submitChange = () => {
        let { markers } = this.state
        // 此时markers内部的坐标全部为wgs坐标
        //console.log(markers)

        console.log('即将提交的数据: ', markers)

        // 和后端讨论好具体格式，可以在formatData函数修改具体数据格式
        //let data = this.formatData(markers)
        let data = []

        add(data).then(
            res => {
                if (res.result == 1) {
                    message.success("模拟profile记录上传成功!")
                    //store.dispatch({ type: 'markers', data })
                    
                    // 刷新数据
                    this.init_data()
                }

            }
        ).catch(
            err => {
                message.error('模拟profile记录上传失败!')
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