# Backend

---

a backend for data processing created by FastAPI

## TODO

* [ ] 后端FastAPI重构

## 安装依赖

```sh
pip install -r requirements.txt
```

## 项目启动

### Window cmd命令启动

run.bat文件内可修改端口

```cmd
.\run.bat
```

### Ubuntu shell命令启动

run.sh文件内可修改端口

```shell
sh run.sh
```

### pyhton命令启动

后端端口设置为8000

```shell
uvicorn app.main:app --reload --host=0.0.0.0 --port=8000
```

## 代码结构

* [main.py](main.py): 主程序文件
* [run.bat](run.bat): windows命令启动项目
* [run.sh](run.sh): shell命令启动项目

## 注意事项

> 1. 项目运行前需在根目录下创建空文件夹tmp
> 2. MongoDB数据库接口实例在`待定`中，需根据要求修改接口

## 相关功能实现

### 1. 数据管理 Data Manage

包括原始CSV文件读取及计算、数据库写入等

### 2. 前台响应 Fronted Server

前台相关服务的响应

### 3. 数据库管理 DB Manage

包括数据库管理、数据库读取等
