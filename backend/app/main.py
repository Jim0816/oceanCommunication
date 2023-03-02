from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .router import analysis    # 分析数据
from .router import info        # 发射接收机数据
from .router import raw         # 原始数据

app = FastAPI()

# 跨域资源共享
origins = [
    # "http://localhost:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加路由
app.include_router(analysis.router)
app.include_router(info.router)
app.include_router(raw.router)

@app.get('/')
async def root():
    return {"message":"This is a backend created by FastAPI"}
