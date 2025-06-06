import copy
import mimetypes
import os.path
import threading
import time
from os import PathLike
from typing import Optional

from tinydb import TinyDB, Query

from core.common import route_utils
from core.common.file_utils import get_file_ext
from core.common.route_utils import extra_data_by_list
from core.log.log import logger


class FileType:
    """文件类型"""
    FOLDER = "0"
    FILE = "1"
    PHOTO = "2"
    MUSIC = "3"
    VIDEO = "4"
    MCE_TEXT = "5"
    PDF = "6"
    ZIP = "7"

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

    key_list = ["id", "name", "parentId", "type", "updateTime", "size", "mimeType"]

    def __init__(self, db_path: str, config: dict):
        """
        加载本地数据
        :param db_path:数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.query = Query()
        self.thread_lock = threading.Lock()
        self.init(config)

    def init(self, config: dict):
        if len(self.db.all()) == 0:
            for data in config["default_folders"]:
                self.db.insert(data)

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

    def is_exist_by_filename(self, filename: str) -> bool:
        """判断文件是否存在"""
        with self.thread_lock:
            return self.db.get(self.match_partial("path", filename)) is not None

    def get_data(self, data_id) -> Optional[dict]:
        """
        获取文件数据
        :param data_id:
        :return:
        """
        with self.thread_lock:
            data = self.db.get(self.query.id == data_id)  # type:ignore
            return data

    def get_data_by_keys(self, data_id) -> Optional[dict]:
        """
        获取文件数据
        :param data_id:
        :return:
        """
        with self.thread_lock:
            data = self.db.get(self.query.id == data_id)  # type:ignore
            return extra_data_by_list(data, self.key_list)

    def get_folder_detail(self, data_id: str, search_type: str, page: int, limit: int) -> dict:
        """获取文件夹详情及该文件夹下的内容"""
        return_data = {}
        with self.thread_lock:
            folder_data = self.db.get(self.query.id == data_id)
            folder_data = extra_data_by_list(folder_data, self.key_list)
            return_data.update(folder_data)
            # 获取文件夹路径
            parents = []
            now_parent_id = folder_data["parentId"]
            while now_parent_id is not None:
                parent_data = self.db.get(self.query.id == now_parent_id)  # type:ignore
                parents.append(extra_data_by_list(parent_data, self.key_list))
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
            contents.append(extra_data_by_list(data_item, self.key_list))
        return_data["contents"] = contents
        return return_data

    @staticmethod
    def default_sort_key(data):
        """默认排序"""
        return int(data["type"]), data["name"]

    def add(self, data: dict) -> str:
        """
        新增
        :param data: 直接的数据结构
        :return: 返回数据ID
        """
        data["id"] = route_utils.gen_id()
        data["updateTime"] = str(time.time())
        data["name"] = str(data["name"]).strip()
        with self.thread_lock:
            self.db.insert(data)
        return data["id"]

    def edit_folder(self, folder_id: str, data_input: dict):
        """编辑文件夹"""
        data_input = extra_data_by_list(data_input, ["name", "parentId"])
        with self.thread_lock:
            data = self.db.get((self.query.id == folder_id) & (self.query.type == FileType.FOLDER))
            data["name"] = str(data_input["name"]).strip()
            data["parentId"] = data_input["parentId"]
            data["updateTime"] = str(time.time())
            self.db.update(data, (self.query.id == folder_id) & (self.query.type == FileType.FOLDER))

    def edit_file(self, file_id: str, data_input: dict):
        """编辑文件"""
        data_input = extra_data_by_list(data_input, ["name", "parentId", "size"])
        with self.thread_lock:
            data = self.db.get((self.query.id == file_id) & (self.query.type != FileType.FOLDER))
            data.update(data_input)
            data["updateTime"] = str(time.time())
            self.db.update(data, (self.query.id == file_id) & (self.query.type != FileType.FOLDER))

    def delete_file(self, file_id: str):
        """删除文件"""
        with self.thread_lock:
            self.db.remove((self.query.id == file_id) & (self.query.type != FileType.FOLDER))

    def delete_folder(self, folder_id: str):
        """删除文件夹"""
        with self.thread_lock:
            will_ids = [folder_id]  # 记录所有需要删除的内容
            now_search = [folder_id]  # 当前要遍历的文件夹
            temp_search = []  # 缓存
            while len(now_search) > 0:
                for now_id in now_search:
                    search_datas = self.db.search(self.query.parentId == now_id)
                    for data_item in search_datas:
                        will_ids.append(data_item["id"])
                        if data_item["type"] == FileType.FOLDER:
                            temp_search.append(data_item["id"])
                now_search = copy.deepcopy(temp_search)
                temp_search.clear()
            for will_id in will_ids:
                self.db.remove(self.query.id == will_id)

    def search_file(self, name: str, page, limit):
        """搜索文件和文件夹"""
        return_data = {}
        with self.thread_lock:
            content_data = self.db.search(self.match_partial("name", name))
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
            contents.append(extra_data_by_list(data_item, self.key_list))
        return_data["contents"] = contents
        return return_data

    @staticmethod
    def match_partial(field: str, search_value: str):
        """部分匹配"""
        search_value = search_value.strip().lower()
        def query(item):
            text = str(item.get(field, "")).lower()
            return search_value in text

        return query

    def tidy_up_data(self, ext_config: dict):
        """整理文件"""
        filter_ext_dict = {}
        for key in ext_config:
            try:
                int_key = int(key)
                filter_ext_dict[str(int_key)] = ext_config[key]
            except ValueError:
                continue
        with self.thread_lock:
            all_data = self.db.all()
            for data in all_data:
                try:
                    if data["type"] == FileType.FOLDER:
                        continue
                    file_ext = get_file_ext(data["path"])
                    suit_type = FileType.FILE
                    for type_index, ext_list in filter_ext_dict.items():
                        if file_ext in ext_list:
                            suit_type = type_index
                            break
                    if "mimeType" not in data:
                        data["mimeType"], _ = mimetypes.guess_type(data["path"])
                    data["size"] = os.path.getsize(data["path"])
                    data["type"] = suit_type
                    self.db.update(data, self.query.id == data["id"])  # type:ignore
                except Exception as e:
                    logger.error("整理文件时错误：%s" % e)

    def get_near_file(self, file_id: str):
        """获取相邻同类型的文件"""
        with self.thread_lock:
            data = self.db.get(self.query.id == file_id)
            search_data = self.db.search(
                (self.query.parentId == data["parentId"]) & (self.query.type == data["type"])  # type:ignore
            )
        search_data = sorted(search_data, key=self.default_sort_key)
        index = None
        for i in range(len(search_data)):
            if search_data[i]["id"] == data["id"]:
                index = i
                break
        return_data = {"last": None, "next": None}
        if index > 0:
            return_data["last"] = extra_data_by_list(search_data[index - 1], self.key_list)
        if index < len(search_data) - 1:
            return_data["next"] = extra_data_by_list(search_data[index + 1], self.key_list)
        return return_data

    @staticmethod
    def gen_add_dict(filename: str, ext_key: str, parent_id: str, filepath: PathLike) -> dict:
        """生成新增所需数据结构"""
        file_size = os.path.getsize(filepath)
        mimetype, _ = mimetypes.guess_type(filepath)
        return {
            "name": filename,
            "type": ext_key,
            "parentId": parent_id,
            "path": filepath,
            "size": file_size,
            "mimeType": mimetype
        }
