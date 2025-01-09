import threading

from tinydb import TinyDB, Query


class MusicServer:

    def __init__(self, db_path: str):
        """
        加载本地数据
        :param db_path:数据库文件路径
        """
        self.db = TinyDB(db_path)
        self.query = Query()
        self.thread_lock = threading.Lock()


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
