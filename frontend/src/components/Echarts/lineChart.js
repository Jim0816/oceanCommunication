import React from 'react';
// import {Card} from 'antd';
//不是按需加载的话文件太大
//import echarts from 'echarts'
//下面是按需加载
//import echarts from 'echarts/lib/echarts'
//导入折线图
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/markPoint';
import ReactEcharts from 'echarts-for-react';
import { string } from 'prop-types';


export default class LineChart extends React.Component{

    getOption = () => {
        const {title, labels, sub_labels, values} = this.props
        // 调整上面横坐标展示效果 只显示0
        var new_sub_labels = []
        for (let i = 0 ; i < sub_labels.length ; i++){
          new_sub_labels.push(sub_labels[i] === '0' || sub_labels[i] === 0 ? '0' : '');
        }
        //console.log(labels)
        //console.log(sub_labels)
        let option = {
            // Make gradient line here
            visualMap: [
              {
                show: false,
                type: 'continuous',
                seriesIndex: 0,
                min: 0,
                max: 200
              }
            ],
            title: [
              {
                left: 'center',
                text: title,
                textStyle: {
                  fontSize: 15,
                  lineHeight: 15
                },
              }
            ],
            tooltip: {
              trigger: 'axis',
              // 设置浮层的 css 样式
              extraCssText: 'width:auto;height:auto;background-color:rgba(0,0,0,0.3);color:#fff',
              formatter: function (params) {
                //params[0].name表示x轴数据
                let str = params[0].name + '\t' + (params[0].dataIndex%1024) + '<br/>'
                //params是数组格式
                for (let item of params) {
                //设置浮层图形的样式跟随图中展示的颜色
                  str += "<span style='display:inline-block;width:10px;height:10px;border-radius:10px;background-color:" + item.color + ";'></span>" + "\t" + item.seriesName + " : " + item.value + '<br/>'
                }
                return str
              },
            },
            legend: {
              data: [values[0].name, values[1].name],
              right: '5%'
            },
            xAxis: [
              {
                type: 'category',
                position: 'bottom',
                boundaryGap: false,
                data: labels
              },
              {
                type: 'category',
                position: 'top',
                boundaryGap: false,
                data: new_sub_labels
              }
            ],
            yAxis: {type: 'value'},
            grid: {
                top: '30%',
                left: '30px',
                right: '30px',
                bottom: '15%'
            },
            series: [
              {
                type: 'line',
                showSymbol: false,
                name: values[0].name,
                data: values[0].value,
                itemStyle : {  
                    normal : {
                        color:'red',  
                        lineStyle:{  
                            color:'red'  
                        }  
                    }  
                },  
              },
              {
                type: 'line',
                showSymbol: false,
                name: values[1].name,
                data: values[1].value,
                itemStyle : {  
                  normal : {
                      color:'green',  
                      lineStyle:{  
                          color:'green'  
                      }  
                  }  
              },  
              }
            ]
          };
        return option
    }
  
    render(){
      let {height} = this.props
      let chartHeight = height + 'px'
      return(
        <div>
          <div style={{width: '100%', height: chartHeight}}>
              <ReactEcharts option={this.getOption()} theme="Imooc"  style={{width: '100%', height:'100%'}}/>
          </div>
        </div>
      )
    }
  }
  