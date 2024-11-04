import threading

from tinydb import TinyDB, Query

from core.common import route_utils


class FileType:
    """文件类型"""
    FOLDER = "0"
    FILE = "1"

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
                "path": None
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

    def add(self, data: dict):
        """
        新增
        :param data: 直接的数据结构
        :return:
        """
        data["id"] = route_utils.gen_id()
        self.db.insert(data)
