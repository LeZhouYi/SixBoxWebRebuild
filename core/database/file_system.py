import threading
import time
from typing import Optional

from tinydb import TinyDB, Query

from core.common import route_utils
from core.common.route_utils import extra_data_by_list


class FileType:
    """文件类型"""
    FOLDER = "0"
    FILE = "1"
    PHOTO = "2"
    MUSIC = "3"
    VIDEO = "4"

    @staticmethod
    def is_exits(value: str) -> bool:
        """
        判断是否存在对应类型
        :param value:
        :return: true表示存在
        """
        try:
            value = int(value)
        except ValueError:
            return False
        return 0 <= value <= 1


class FileSystemServer:
    """文件系统数据库相关"""

    def __init__(self, db_path: str):
        """
        加载本地数据
        :param db_path:数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.query = Query()
        self.thread_lock = threading.Lock()

        if len(self.db.all()) == 0:
            self.db.insert({
                "id": "1",
                "name": "根目录",
                "type": FileType.FOLDER,
                "parentId": None,
                # "path": None,
                "updateTime": str(time.time()),
                # "size": None
            })

    def is_folder_exist(self, data_id: str) -> bool:
        """
        判断该文件夹是否存在
        :param data_id:
        :return: False表示不存在
        """
        with self.thread_lock:
            data = self.db.get(self.query.id == data_id)
            if data is not None and "type" in data and data["type"] == FileType.FOLDER:
                return True
            return False

    def is_file_exist(self, data_id: str) -> bool:
        """
        判断该文件是否存在
        :param data_id:
        :return: False表示不存在
        """
        with self.thread_lock:
            data = self.db.get(self.query.id == data_id)
            if data is not None and "type" in data and data["type"] != FileType.FOLDER:
                return True
            return False

    def get_data(self, data_id) -> Optional[dict]:
        """
        获取文件数据
        :param data_id:
        :return:
        """
        with self.thread_lock:
            data = self.db.get(self.query.id == data_id)
            return data

    def get_folder_detail(self, data_id: str, search_type: str, page: int, limit: int) -> dict:
        """获取文件夹详情及该文件夹下的内容"""
        key_list = ["id", "name", "parentId", "type", "updateTime", "size"]
        return_data = {}
        with self.thread_lock:
            folder_data = self.db.get(self.query.id == data_id)
            folder_data = extra_data_by_list(folder_data, key_list)
            return_data.update(folder_data)
            # 获取文件夹路径
            parents = []
            now_parent_id = folder_data["parentId"]
            while now_parent_id is not None:
                parent_data = self.db.get(self.query.id == now_parent_id)
                parents.append(extra_data_by_list(parent_data, key_list))
                now_parent_id = parent_data["parentId"]
            parents = list(reversed(parents))
            return_data["parents"] = parents
            # 处理子文件夹
            query_search = (self.query.parentId == data_id)
            if search_type is not None:
                query_search = query_search & (self.query.type == search_type)
            content_data = self.db.search(query_search)
            # 排序
            content_data = sorted(content_data, key=self.default_sort_key)
            # 计算总数
            return_data["total"] = len(content_data)
            # 分页
            if page is not None and limit is not None:
                content_data = content_data[page * limit:(page + 1) * limit]
            # 只返回部分字段
            contents = []
            for data_item in content_data:
                contents.append(extra_data_by_list(data_item, key_list))
            return_data["contents"] = contents
        return return_data

    @staticmethod
    def default_sort_key(data):
        """默认排序"""
        return int(data["type"]), data["name"]

    def add(self, data: dict):
        """
        新增
        :param data: 直接的数据结构
        :return:
        """
        data["id"] = route_utils.gen_id()
        data["updateTime"] = str(time.time())
        self.db.insert(data)
