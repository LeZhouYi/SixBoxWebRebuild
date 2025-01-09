import threading

from tinydb import TinyDB, Query

from core.common import route_utils


class MusicServer:

    def __init__(self, db_path: str):
        """
        加载本地数据
        :param db_path:数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.query = Query()
        self.thread_lock = threading.Lock()

    def add(self, data):
        """新增数据"""
        data["id"] = route_utils.gen_id()
        with self.thread_lock:
            self.db.insert(data)

    @staticmethod
    def gen_add_dict(name: str, file_id: str, singer: str, set_id: str):
        return {
            "fileId": file_id,
            "name": name,
            "singer": singer,
            "setId": set_id
        }


class MusicSetServer:

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
            for data in config["music_set_defaults"]:
                self.db.insert(data)

    def is_exist(self, set_id: str) -> bool:
        """判断是否存在该合集"""
        with self.thread_lock:
            data = self.db.get(self.query.id == set_id)
            if data is not None:
                return True
            return False
