import React, { Component } from 'react'
import {Map, CustomOverlay} from 'react-bmapgl';
import EnergyChart from '../../components/Echarts/energy'
import Triangle from '../../components/MyCharts/Triangle'
import interaction from './index.module.css'
import store from '../../store/index';
import {bd_decrypt_To_gcj, gcj_decrypt_To_wgs, getDistance} from '../../utils/mapUtil'

export default class index extends Component {

  state = {
    map: {}, // 地图对象引用
    markers: [], // 页面暂存对象集合
    distance: 0,
  }
  
  constructor(props) {
    super(props)
    this.state.markers = store.getState().markers
  }
  render() {
    return (
      <div className={interaction.container}>
          <div className={interaction.left}>1</div>
          <div className={interaction.center}>2</div>
          <div className={interaction.right}>
            <div className={interaction.right_top}>收发距离: {this.state.distance} m</div>
            <div id="map" className={interaction.right_bgmap}>
            </div>
          </div>
      </div>
    )
  }

  componentDidMount() {
    let {markers} = this.state
    const map = new window.BMapGL.Map("map");          // 创建地图实例 
    var point = new window.BMapGL.Point(111.91339017089847, 21.085693492605827);  // 创建点坐标 
    map.centerAndZoom(point, 9);  
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放    
    var scaleCtrl = new window.BMapGL.ScaleControl();  // 添加比例尺控件
    map.addControl(scaleCtrl);
    var zoomCtrl = new window.BMapGL.ZoomControl();  // 添加缩放控件
    map.addControl(zoomCtrl);

    // 初始化所有marker
    this.init_markers(map)

    var copyrights = document.getElementsByClassName(' BMap_cpyCtrl anchorBL');
    if (copyrights.length > 0){
      copyrights[0].style.display = 'none'
    }

    this.state.map = map
    console.log(markers)
    // 计算距离
    //let location_0 = this.trancformLocation(markers[0].lat, markers[0].lng)
    //let location_1 = this.trancformLocation(markers[1].lat, markers[1].lng)
    //let distance = getDistance( location_0.lat, location_0.lon, location_1.lat, location_1.lon)
    //console.log(distance)
    //this.state.distance = distance
    this.forceUpdate()
  }

  init_markers = (map) => {
    let {markers} = this.state
    for (let i = 0 ; i < markers.length ; i++){
      let item = markers[i]
      let point = new window.BMapGL.Point(item.lng, item.lat);  // 创建点坐标 
      let myIcon = new window.BMapGL.Icon(item.icon, new window.BMapGL.Size(item.size, item.size), {anchor: new window.BMapGL.Size(0, 0)});     
      let marker = new window.BMapGL.Marker(point, {title: item.id + ':' + item.name, icon: myIcon, enableDragging: false, enableClicking: true, draggingCursor: 'move'});
      marker.setRotation(item.angle + 45)
      // 点击事件
      marker.addEventListener('click', (e) => {this.updateBottomInfo(e)});
      // 覆盖物拖拽开始事件
      //marker.addEventListener('dragstart', (e) => {this.updateBottomInfo(e)});
      // 覆盖物拖拽事件
      // marker.addEventListener('dragend', function () {
      //     var nowPoint = marker.getPosition(); // 拖拽完成之后坐标的位置
      //     console.log('当前位置:', nowPoint)
      // });
      map.addOverlay(marker); 
    }
  }

  trancformLocation = (bdLat, bdLon) => {
    let gcj_location = bd_decrypt_To_gcj(bdLat, bdLon)
    let wgs_location = gcj_decrypt_To_wgs(gcj_location.lat, gcj_location.lon)
    return wgs_location
  }

}
