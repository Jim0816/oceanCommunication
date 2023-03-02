import random
import pymongo
import datetime
import numpy as np
import pandas as pd
from scipy.fftpack import fft
from bson.binary import Binary
import pickle
import time
from app.models.FFT import FFT

# 数据库管理类
class Manage:
    def __init__(self, IP = 'localhost', port = 27017, db = 'testDB'):
        self.Client = pymongo.MongoClient(IP, port)
        self.DB = self.Client[db]
        self.Col_FFT = self.DB['FFT']
        self.Col_FFT_heatmap = self.DB['FFT_Heatmap']
        self.Col_Info = self.DB['Info']

        self.progress = {}

    # 读txt或csv
    async def read_file(self, filename: str):
        split_l = filename.split("_")[-1].split(".")
        # 时间
        start_time = datetime.datetime.strptime(split_l[0], "%Y%m%d%H%M%S")
        # 文件类型
        filetype = split_l[1]
        
        if filetype == 'txt':
            contents = pd.read_csv(filename, header=None, names=['count', 'channel1', 'channel2'], sep='\t')
        elif filetype == 'csv':
            contents = pd.read_csv(filename, header=None, names=['count', 'channel1', 'channel2'])
        else:
            print("Wrong file type")

        timer1 = time.time()
        contents['amplitude'] = np.sqrt(contents['channel1'] ** 2 + contents['channel2'] ** 2)
        contents['frequency'] = 0

        sec = contents.shape[0] // 1024

        for i in range(sec): # 每1024个点做fft
            contents.iloc[i * 1024:(i + 1) * 1024, 4] = np.log(np.abs(fft(np.array(contents.iloc[i * 1024:(i + 1) * 1024, 3]))))

        contents['time'] = contents['count'].apply(lambda x : start_time + datetime.timedelta(seconds = (x - 1) // 1024))
        contents['sample'] = (contents['count'] - 1) % 1024

        # 需修改数据类型，pymongo不支持numpy数据类型
        # contents = contents.astype({
        #     'channel1': 'float',
        #     'channel2': 'float',
        #     'amplitude': 'float',
        #     'frequency': 'float',
        #     'sample': 'int',
        #     })
        # print(contents.dtypes)

        res_fft = []
        for i in range(contents.shape[0]):
            res_fft.append({
                "time": contents.loc[i, 'time'],
                "sample": int(contents.loc[i, 'sample']),
                "channel1": float(contents.loc[i, 'channel1']),
                "channel2": float(contents.loc[i, 'channel2']),
                "amplitude": float(contents.loc[i, 'amplitude']),
                "frequency": float(contents.loc[i, 'frequency']),
            })

        timer2 = time.time()
        print('创建FFT存储数组时间：', timer2 - timer1)

        y_max = float(format(contents['amplitude'].max(), '.4f'))
        y_min = float(format(contents['amplitude'].min(), '.4f'))

        v_max = contents['frequency'].max()
        v_min = contents['frequency'].min()

        print("y_max: ", y_max)
        print("y_min: ", y_min)
        # 小数的有效位数，需要根据实际情况调整，表示热度图的纵轴刻度间隔的有效数字，一般保证纵轴刻度数量不大于100
        # 根据y_max - y_min自由调整
        # 比如y_max = 1.61, y_min = 1.57, y_max - y_min = 0.04, 可取significant_digit = 3, 刻度间隔为0.001, 纵轴有40个刻度
        significant_digit = 1
        interval = 1 / (10 ** significant_digit)

        y_num = int((y_max - y_min) / interval)

        init_heatmap = np.array([[float(format(i / 1024, '.2f')), float(format(y_min + interval * j, '.{}f'.format(significant_digit))), v_min] for i in range(1024) for j in range(y_num)])

        res_heatmap = []
        sec = contents.shape[0] // 1024
        for i in range(sec):
            self.progress[filename.split("\\")[-1]] = i / sec
            tmp = {}
            second_time = contents.iloc[i * 1024, 5]
            tmp['time'] = second_time

            second_data = contents.iloc[1024 * i: 1024 * (i + 1), [3, 4, 6]]
            tmp_heatmap = init_heatmap.copy()
            
            for j in range(1024):
                k = np.array([[float(format(j / 1024, '.2f')), float(format(second_data.iloc[j, 0], '.{}f'.format(significant_digit))), second_data.iloc[j, 1]]])
                tmp_heatmap = np.r_[tmp_heatmap, k]
            
            tmp['heatmap'] = Binary(pickle.dumps(tmp_heatmap, protocol=-1), subtype=128)
            # f, ax = plt.subplots(figsize = (10, 4))
            # cmap = sns.cubehelix_palette(start = 1, rot = 3, gamma=0.8, as_cmap = True)
            # sns.heatmap(init_heatmap, vmax = v_max, vmin = v_min, cmap = 'Greens', linewidths = 0.05, ax = ax)
            # ax.set_title('Amounts per kind and region')
            # ax.set_xlabel('region')
            # ax.set_ylabel('kind')
            # f.savefig('sns_heatmap_normal.jpg', bbox_inches='tight')
            
            res_heatmap.append(tmp)

        print('创建热力图存储数组时间：', time.time() - timer2)
        # print(len(res_fft))

        return res_fft, res_heatmap
    
    # 读一个文件返回是否需要替换等后续操作
    # 处理替换，默认replace为否
    # 时间空窗的填补
    async def read_one(self, filename, replace = False):
        split_l = filename.split("_")[-1].split(".")
        time = datetime.datetime.strptime(split_l[0], "%Y%m%d%H%M%S")
        filetype = split_l[1]

        end_time = time + datetime.timedelta(seconds=32)

        # 填充时间空窗
        try:
            time1 = self.Col_FFT.find_one(
                {
                    "time": {
                        "$lt": time
                    }
                },
                sort=[("time", -1)])["time"]
            dummy = (time - time1).seconds
            tmp = []
            for i in range(1, dummy):
                for j in range(1024):
                    tmp.append({
                        "time": time1 + datetime.timedelta(seconds=i),              # 采样时间
                        "sample": j,
                        "channel1": 0,
                        "channel2": 0,
                        "amplitude": 0,
                        "frequency": 0,
                    })
            self.Col_FFT.insert_many(tmp)
        except:
            pass

        overlap = self.Col_FFT.find({"time": {
            "$gte": time,
            "$lt": end_time
        }})

        if len(list(overlap)) != 0 and not replace:
            return True
        
        if replace:
            self.Col_FFT.remove({"time": {
                "$gte": time,
                "$lt": end_time
            }})

        sample, heatmap = await self.read_file(filename)

        self.Col_FFT.insert_many(sample)
        self.Col_FFT_heatmap.insert_many(heatmap)

        return False

    # 清空集合
    async def clear_db(self):
        # self.Col_FFT.remove()
        # self.Col_FFT_heatmap.remove()
        self.Col_FFT.delete_many({})
        self.Col_FFT_heatmap.delete_many({})

    # 截取数据，开始时间->结束时间，sample排序
    async def search_by_time(self, start_time, end_time):
        res = list(self.Col_FFT.find(
            {"time": {
                "$gte": start_time,
                "$lte": end_time
                }
            },
            sort=[("time", 1), ("sample", 1)]
        ))
        time = [datetime.datetime.strftime(x["time"], "%Y-%m-%d %H:%M:%S") for x in res]
        sample = [x['sample'] for x in res]
        channel1 = [x["channel1"] for x in res]
        channel2 = [x["channel2"] for x in res]
        amplitude = [x["amplitude"] for x in res]
        return time, sample, channel1, channel2, amplitude

    # 获取数据库起止时间
    async def get_db_start_end_time(self):
        try:
            db_start_time = self.Col_FFT.find_one(sort=[("time", 1)])["time"]
            db_end_time = self.Col_FFT.find_one(sort=[("time", -1)])["time"]
            return db_start_time, db_end_time
        except:
            return datetime.datetime.now(), datetime.datetime.now()
    
    # 获取brush内数据
    async def get_brush_data(self, coord1, coord2):
        res = list(self.Col_FFT.find(sort=[("time", 1), ("sample", 1)]))[coord1:coord2]
        return res

    # 获取热度图数据
    async def get_brush_heatmap_data(self, coord1, coord2):
        res = list(self.Col_FFT.find(sort=[("time", 1), ("sample", 1)]))[coord1:coord2]
        time1 = res[0]['time']
        time2 = res[-1]['time']
        
        res = list(self.Col_FFT_heatmap.find(
            {"time": {
                "$gte": time1,
                "$lte": time2
                }
            },
            sort=[("time", 1)]
        ))

        tmp = pickle.loads(res[0]['heatmap'])
        for i in range(1, len(res)):
            h = pickle.loads(res[i]['heatmap'])
            h[:, 0] = h[:, 0] + i
            tmp = np.r_[tmp, h]
        # print(tmp)
        return tmp

    # 获取数据处理进度
    async def get_progress(self):
        print(self.progress)
        return self.progress

    # 向数据库存储<发射、接收>信息
    async def insert_info(self, data):
        self.Col_Info.insert_one(data)
        return 
    
    # 向数据库请求时间最近的文件内容
    async def get_filenames(self, num):
        data = list(self.Col_Info.find(sort=[("time", -1)]))[:num]
        # res = [d['filename'] for d in data]
        for i in range(len(data)):
            data[i]['_id'] = data[i]['_id'].__str__()
            data[i]['time'] = datetime.datetime.strftime(data[i]['time'], "%Y-%m-%d %H:%M:%S")
        return data

    # 删除info集合内容
    async def clear_info(self):
        self.Col_Info.delete_many({})

    # 查询并排序testCol A B C三个数据库中的数据
    async def get_ABC_data(self, sec = 10):
        col_name = ['testColA', 'testColB', 'testColC']
        res = {}
        charts = []
        for i in range(len(col_name)):
            cursor = self.DB[col_name[i]].find(sort=[("time", -1), ("sample", -1)])
            data = []
            cnt = 0
            for docm in cursor:
                data.insert(0, docm)
                cnt += 1
                if cnt == 1024 * sec:
                    break
            # data = list(self.DB[col_name[i]].find(sort=[("time", 1), ("sample", 1)]))[-sec*1024:]
            if i == 0:
                res['labels'] = [datetime.datetime.strftime(x['time'], "%Y-%m-%d %H:%M:%S") for x in data]
                res['sub_labels'] = [x['sample'] for x in data]
            tmp = {}
            tmp['title'] = col_name[i]
            tmp['values'] = [
                {
                    'name': 'channel1',
                    'value': [x['channel1'] for x in data],
                },
                {
                    'name': 'channel2',
                    'value': [x['channel2'] for x in data],
                },
            ]
            charts.append(tmp)
        res['charts'] = charts
        return res
    
    # 向ABC三个数据库插入数据，供测试用
    def _test_insert_ABC(self, sec = 10):
        col_name = ['testColA', 'testColB', 'testColC']
        time = datetime.datetime.now()
        for name in col_name:
            col = self.DB[name]
            for i in range(sec):
                for j in range(1024):
                    col.insert_one({
                        'time': time + datetime.timedelta(seconds=i),
                        'sample': j,
                        'channel1': random.random(),
                        'channel2': random.random(),
                    })
    
    # 从ABC三个数据库中取热力图数据
    async def get_ABC_heatmap_data(self, start_time = "2022-9-2 11:22:00", end_time = "2022-9-2 11:27:44", col_name = "testColA", channel = "channel1", critical_frequencies = 30, seconds = 16):
        col = self.DB[col_name]

        start_time = datetime.datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
        end_time = datetime.datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")

        # start_time = col.find({
        #     "time": {
        #         "$gte": start_time,
        #     }
        # }, sort=[("time", 1)])[0]["time"]

        # end_time = col.find({
        #     "time": {
        #         "$lt": end_time,
        #     }
        # }, sort=[("time", -1)])[0]["time"]

        if (end_time - start_time).seconds % seconds != 0:
            print("时间不是seconds={}的整数倍，需要修正时间".format(seconds))
        
        time_d = (end_time - start_time).seconds // seconds # 每seconds秒数计算一次FFT
        if time_d == 0:
            print("时间长度不够")
            return {
                "error": "时间长度不够{}s".format(seconds)
            }
        end_time = start_time + datetime.timedelta(seconds=time_d * seconds) # 修正结束时间

        print("start_time: {}, end_time: {}".format(start_time, end_time))

        ptr = col.find({
            "time": {
                "$gte": start_time,
                # "$lt": end_time,
            }
        }, sort=[("time", 1), ("sample", 1)])

        channel_list = [] # 需要FFT的值
        time_list = [] # 时间长度的横轴

        cnt = 0
        for data in ptr:
            if cnt ==0:
                print("start time:{}".format(data["time"]))
            channel_list.append(data[channel])
            cnt += 1
            if cnt == time_d * seconds * 1024:
                print("end time: {}".format(data["time"]))
                break
        res = None
        time_d = int((cnt / 1024) // seconds)
        #print(time_d)

        if time_d == 0:
            return {
                "error": "No data in DB"
            }

        for i in range(time_d):
            time_list.append(datetime.datetime.strftime(start_time + datetime.timedelta(seconds=i * seconds), "%Y-%m-%d %H:%M:%S"))
            
            f, a = FFT(channel_list[1024 * i * seconds: 1024 * (i + 1) * seconds], critical_frequencies)

            #print(f.shape)
            #print(a.shape)
            #print("-----------"*3)

            if res is None:
                res = a
            else:
                res = np.c_[res, a]

        data_list = []
        for i in range(time_d):
            for j in range(len(f)):
                data_list.append([i, j, res[j, i]])

        res_json = {
            "xList": time_list,
            "yList": f.tolist(),
            "dataList": data_list
        }

        return res_json

# 实例化
DBManage = Manage()