import React, { Component } from 'react'
import { Checkbox, message, Button, Alert, Spin ,DatePicker } from 'antd';
import { CloudSyncOutlined } from '@ant-design/icons';
import hotchart from './index.module.css'
import HotChart from '../../components/Echarts/hotchart'
import moment from 'moment'

const { RangePicker } = DatePicker;

// 后端数据返回格式
const data = {
  xList: ['x1', 'x2', 'x3'], //所有横坐标
  yList: ['y1', 'y2'], //所有纵坐标
  dataList: [
    [0,0,10], [0,1,80],
    [1,0,30], [1,1,60],
    [2,0,50],[2,1,100]
  ], // 数据
}

export default class index extends Component { 
  state = {
    xList: [], //所有横坐标
    yList: [], //所有纵坐标
    dataList: [], // 后端传递的真实数据
    cur_data: [], // 动态追加渲染的数据
    form: { start_time: new Date().getTime(), end_time: new Date().getTime() }, // 用户输入信息
    interval: 300, // 播放间隔时间单位毫秒 
    col_index: 0, //记录播放到第几列
    player: null, // 定时播放器对象
  }
   formatDate(date) {
    var date = new Date(date);
    console.log(date);
    var YY = date.getFullYear() + '-';
    var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
    var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    let s = YY + MM + DD +" "+ hh + mm + ss ;
    return s ;
  }

  analyse = () => {
    let { form, player, interval } = this.state
    // 根据用户输入去获取后端数据
    this.getData(form.start_time, form.end_time).then(res => {
      console.log(res)
      // 将后端返回数据存入本页state
      this.setState({
        xList: res.xList,
        yList: res.yList,
        dataList: res.dataList,
      })

      // 进行动态播放
      if (player != null){
        clearInterval(player)
        this.state.player = null
        this.state.col_index = 0
      }
      this.state.player = setInterval(() => {this.play()}, interval)

    });
  }

  // 底部输入框更新输入数据
  changeValue = (key, event) => {
    let { form } = this.state
    switch (key) {
        case 'start_time':
          form.start_time = event == null ? '' : event
          break;
        case 'end_time':
          form.end_time = event == null ? '' : event
          break;
        default:
          break;
    }
    this.state.form = form
  }

  // 获取后端数据 参数：起始时间， 结束时间 ； 返回值
  async getData(start_time, end_time) {
    // 这里获取后端数据，后面替换为请求后端方法 
    console.log(start_time,end_time)
      try {
        let res = await fetch('http://localhost:8000/info/heatmap?start_time=' + this.formatDate(start_time) + '&end_time=' + this.formatDate(end_time))
        let data = await res.json()
        //console.log(data)
        console.log("daijunwei")
        return data
    } catch (err) {
      message.error("获取数据失败，展示测试数据")
      console.log("获取后端数据失败", err)
      return data
    }
  }
  

  play = () => {
    let {col_index, xList, yList, player, dataList, cur_data} = this.state
    let col_num = yList.length

    if (col_index == xList.length){
      // 全部播放完成 -> 1.清理定时器 2.count恢复初始值1
      message.success("播放结束!")
      clearInterval(player)
      this.state.player = null
      this.state.count = 0
      this.forceUpdate()
      return;
    }

    // 更新展示数据 追加当前列到cur_data
    let start_index = col_index * col_num
    let end_index = start_index + col_num - 1
    let data = JSON.parse(JSON.stringify(cur_data))
    for (let i = start_index ; i <= end_index ; i++){
      data.push(dataList[i])
    }
    
    this.setState({
      cur_data: data,
      col_index: col_index + 1 
    })
  }
   changeDate =(dates) => {
          this.setState({
      form:{
         start_time: moment(dates[0]),
         end_time: moment(dates[1])
           }
  })
                          }


  render() {
    let {xList, yList, cur_data} = this.state
    return (
      <div className={hotchart.container}>
        <HotChart xList={xList} yList={yList} data={cur_data}/>
        <div className={hotchart.bottom}>
          <Button type="primary" icon={<CloudSyncOutlined />} style={{ backgroundColor: "#428bca", marginTop: 0, marginLeft: 70 }} onClick={this.analyse}>分析</Button>
                {/* <span className={hotchart.bottomSpan} style={{ width: '200px' }}>起始时间： */}
                    {/* <input type="datetime-local"  value={moment().format('YYYY-MM-DD hh:mm')}
                  style={{
                      width: 160, 
                        }}
                 defaultValue="1"
                  step="1"
                  stringMode
                  controls={false}
                  onChange={(event) => this.changeValue('start_time', event)}
                    /> */}
                <RangePicker  showTime format="YYYY-MM-DD HH:mm:ss"  
                    placeholder={["开始时间", "结束时间"]} onChange={(val) => this.changeDate(val)} 
                />
                    
          {/* </span> */}
                {/* <span className={hotchart.bottomSpan} style={{ width: '200px' }}>结束时间：
                    <input type="datetime-local" 
                  style={{
                      width: 160,
                  }}
                  defaultValue="1"
                  step="1"
                  stringMode
                  controls={false}         
                  onChange={(event) => this.changeValue('end_time', event)}
              />
          </span> */}
        </div>
      </div>
    )
  }

 } 
