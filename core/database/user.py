import datetime
import hashlib
import threading
import uuid
from typing import Optional

import jwt
from tinydb import TinyDB, Query

from core.common.route_utils import gen_id
from core.config.config import get_config

JWT_SECRET_KEY = get_config("jwt_secret_key")
JWT_ALGORITHM = get_config("jwt_algorithm")
JWT_EXP_DELTA_SECONDS = int(get_config("jwt_exp_delta_seconds"))


class SessionServer:
    """登录相关"""

    def __init__(self, db_path: str):
        """
        加载本地数据
        :param db_path:数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.query = Query()
        self.thread_lock = threading.Lock()

    def add_data(self, data: dict) -> dict:
        """
        新增，并返回token
        :param data: 应包含 user_id和 client_ip
        :return: access_token和refresh_token
        """
        user_id = data["user_id"]
        access_token = self.generate_access_token(user_id)
        refresh_token = self.generate_refresh_token()
        with self.thread_lock:
            self.db.insert({
                "id": gen_id(),
                "user_id": user_id,
                "client_ip": data["client_ip"],
                "access_token": access_token,
                "refresh_token": refresh_token
            })
        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }

    @staticmethod
    def generate_access_token(user_id: str) -> str:
        """生成access_token"""
        payload = {
            "user_id": user_id,
            "exp": datetime.datetime.now(datetime.UTC) + datetime.timedelta(seconds=JWT_EXP_DELTA_SECONDS)
        }
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        return token

    @staticmethod
    def generate_refresh_token():
        refresh_token = str(uuid.uuid4())
        return refresh_token


class UserServer:
    """用户数据库相关"""

    def __init__(self, db_path: str):
        """
        加载本地数据
        :param db_path:数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.query = Query()
        self.thread_lock = threading.Lock()
        self.hash_algorithm = hashlib.sha256()

        if len(self.db.all()) == 0:
            self.hash_algorithm.update("1234567a".encode("utf-8"))
            self.db.insert({
                "id": 1,
                "name": "admin",
                "account": "admin",
                "password": self.hash_algorithm.hexdigest()
            })

    def is_user_exist(self, account: str, password: str) -> Optional[str]:
        """
        判断用户、密码是否对应
        :param account:
        :param password:
        :return: 若匹配则返回user id
        """
        with self.thread_lock:
            self.hash_algorithm.update(password.encode("utf-8"))
            password = self.hash_algorithm.hexdigest()
            try:
                data = self.db.get(self.query.account == account and self.query.password == password)
            except KeyError:
                return None
        return data["id"]
