import datetime
import hashlib
import threading
import uuid
from typing import Optional

import jwt
from tinydb import TinyDB, Query

from core.common.route_utils import gen_id, is_key_str_empty, extra_data_by_list
from core.config.config import get_config_by_section
from core.log.log import logger

JWT_SECRET_KEY = get_config_by_section("jwt", "secret_key")
JWT_ALGORITHM = get_config_by_section("jwt", "algorithm")
JWT_EXP_DELTA_SECONDS = get_config_by_section("jwt", "exp_delta_seconds")


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
        :param data: 应包含 userId和 clientIp
        :return: accessToken和refreshToken
        """
        user_id = data["userId"]
        client_ip = data["clientIp"]
        access_token = self.generate_access_token(user_id)
        refresh_token = self.generate_refresh_token()
        return_body = {
            "accessToken": access_token,
            "refreshToken": refresh_token
        }
        with self.thread_lock:
            data = self.db.search((self.query.userId == user_id) & (self.query.clientIp == client_ip))  # type:ignore
            if len(data) > 0:
                data[0].update(return_body)
                self.db.update(
                    data[0], (self.query.userId == user_id) & (self.query.clientIp == client_ip)  # type:ignore
                )
            else:
                insert_data = {
                    "id": gen_id(),
                    "userId": user_id,
                    "clientIp": client_ip
                }
                insert_data.update(return_body)
                self.db.insert(insert_data)
        return return_body

    def verify(self, token: str, client_ip: str) -> tuple[bool, str | dict]:
        """解码并验证Token"""
        try:
            decoded = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            if is_key_str_empty(decoded, "userId"):
                return False, "TOKEN INVALID"
            user_id = decoded["userId"]
            with self.thread_lock:
                data = self.db.get((self.query.userId == user_id) & (self.query.clientIp == client_ip)
                                   & (self.query.accessToken == token))
                if data is None:
                    return False, "TOKEN INVALID"
            return True, decoded
        except jwt.ExpiredSignatureError:
            return False, "TOKEN EXPIRED"
        except jwt.InvalidTokenError:
            return False, "TOKEN INVALID"

    def verify_refresh(self, refresh_token: str, client_ip: str) -> tuple[bool, str | dict]:
        """验证refresh token 并重新生成 access token"""
        with self.thread_lock:
            data = self.db.get((self.query.clientIp == client_ip) & (self.query.refreshToken == refresh_token))
            if data is None:
                return False, "TOKEN INVALID"
        try:
            access_token = data["accessToken"]
            decoded = jwt.decode(access_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            if is_key_str_empty(decoded, "userId"):
                return False, "TOKEN INVALID"
            user_id = decoded["userId"]
            access_token = self.generate_access_token(user_id)
            return_body = {
                "accessToken": access_token,
                "refreshToken": refresh_token
            }
            data.update(return_body)
            self.db.update(data, (self.query.userId == user_id) & (self.query.clientIp == client_ip))
            return True, return_body
        except jwt.ExpiredSignatureError or jwt.InvalidTokenError:
            return False, "TOKEN INVALID"

    def delete(self, user_id: str, client_ip: str):
        """删除登录数据"""
        with self.thread_lock:
            self.db.remove(self.query.userId == user_id and self.query.clientIp == client_ip)

    @staticmethod
    def generate_access_token(user_id: str) -> str:
        """生成access_token"""
        payload = {
            "userId": user_id,
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

    key_list = ["id", "name", "background"]

    def __init__(self, db_path: str, config: dict):
        """
        加载本地数据
        :param db_path:数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.query = Query()
        self.thread_lock = threading.Lock()

        if len(self.db.all()) == 0:
            for data in config["user_defaults"]:
                self.db.insert(data)

    def is_user_exist(self, account: str, password: str) -> Optional[str]:
        """
        判断用户、密码是否对应
        :param account:
        :param password:
        :return: 若匹配则返回user id
        """
        with self.thread_lock:
            password = self.hash_encrypt(password)
            data = self.db.get((self.query.account == account) & (self.query.password == password))
            if data is not None:
                return data["id"]

    def get_user(self, user_id: str) -> Optional[dict]:
        """获取用户详情"""
        with self.thread_lock:
            data = self.db.get(self.query.id == user_id)
            if data is not None:
                return extra_data_by_list(data, self.key_list)

    def tidy_up_data(self):
        """整理用户数据"""
        with self.thread_lock:
            all_data = self.db.all()
            for data in all_data:
                try:
                    if "background" not in data:
                        data["background"] = None
                    self.db.update(data, self.query.id == data["id"])  # type:ignore
                except Exception as e:
                    logger.error("整理数据时错误：%s" % e)

    def edit_user(self, user_id: str, data_input: dict):
        """编辑用户"""
        data_input = extra_data_by_list(data_input, ["name", "background"])
        with self.thread_lock:
            data = self.db.get(self.query.id == user_id)
            data["name"] = str(data_input["name"]).strip()
            data["background"] = str(data_input["background"])
            self.db.update(data, self.query.id == user_id)

    @staticmethod
    def hash_encrypt(value: str) -> str:
        """哈希加密"""
        hash_coder = hashlib.sha256()
        hash_coder.update(value.encode("utf-8"))
        return hash_coder.hexdigest()
