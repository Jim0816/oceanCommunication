import React from 'react';
import ReactEcharts from 'echarts-for-react';

const showSize = 80
export default class LineChart extends React.Component{

  render(){
    let {xList, yList, data} = this.props
    return(
      <div style={{width: '100%', height: '100%', overflow: 'auto'}}>
            <ReactEcharts option={this.getOption(xList, yList, data)} theme="Imooc"  style={{width: '100%', height:'100%'}}/>
      </div>
    )
  }

    getOption = (xList, yList, data) => {
      var xmin = 0
      let xmax = showSize
      if (xList.length > showSize){
        let gap = xList.length - showSize
        xmin += gap
        xmax += gap
      }
        var option = {
          grid: {
            top: '50',
            left: '70',            // 固定左边刻度宽度
            right: '100',
            bottom: '30',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            name: '时间/s',
            min: xmin,
            max: xmax,           
            axisTick: {
              show: true,
              alignWithLabel: true,
              interval: 0,
              inside: false,
              length: 4
            },
            data: xList,
          },
          yAxis: {
            type: 'category',
            name: '频率/Hz',
            axisTick: {
              show: true,
              alignWithLabel: true,
              interval: 0,
              inside: false,
              length: 4
            },
            data: yList
          },
          visualMap: {
            min: -80,
            max: -10,
            calculable: true,
            realtime: true,
            inRange: {
              color: ["#00008B","#207cca", "#31ff00", "#f8ff00","#FF0000","#DC143C"]
            },
            inverse: false,
            precision: 0,
            itemWidth: 15,
            itemHeight: '150',
            align: "auto",
            textGap: 4,
            left: "0%",
            top: 40
          },
          series: [
            {
              name: 'Gaussian',
              type: 'heatmap',
              data: data,
              emphasis: {
                itemStyle: {
                  borderColor: '#333',
                  borderWidth: 1
                }
              },
              progressive: 1000,
              animation: false
            }
          ]
        };
        return option;
    }
  }
  