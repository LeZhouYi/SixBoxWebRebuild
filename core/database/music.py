import threading

from tinydb import TinyDB, Query

from core.common import route_utils
from core.common.route_utils import extra_data_by_list


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
        data = extra_data_by_list(data, ["fileId", "name", "singer", "album", "tags"])
        data["id"] = route_utils.gen_id()
        with self.thread_lock:
            self.db.insert(data)
        return data["id"]

    @staticmethod
    def gen_add_dict(name: str, file_id: str, singer: str, album: str, tags: str):
        return {
            "fileId": file_id,
            "name": name,
            "singer": singer,
            "album": album,
            "tags": tags
        }

    def search_data(self, page: int, limit: int, name_like: str = None) -> dict:
        """搜索数据"""
        with self.thread_lock:
            return_data = {}
            if name_like is None:
                data = self.db.all()
            else:
                data = self.db.search(self.match_partial(name_like))
            # 计算总数
            return_data["total"] = len(data)
            # 分页
            if page is not None and limit is not None:
                data = data[page * limit:(page + 1) * limit]
            return_data["contents"] = data
            return return_data

    @staticmethod
    def match_partial(search_value: str):
        """部分匹配"""
        search_value = search_value.strip().lower()

        def query(item):
            for key in ["name", "singer", "album", "tags"]:
                if search_value in str(item.get(key, "")).lower():
                    return True
            return False

        return query

    def get_data(self, music_id: str):
        """获取数据"""
        with self.thread_lock:
            return self.db.get(self.query.id == music_id)

    def is_exist(self, music_id: str):
        """是否存在音频"""
        with self.thread_lock:
            return self.db.get(self.query.id == music_id) is not None

    def edit_data(self, music_id: str, data_input: dict):
        """编辑音频"""
        data_input = extra_data_by_list(data_input, ["name", "singer", "album", "tags"])
        with self.thread_lock:
            data = self.db.get(self.query.id == music_id)
            data.update(data_input)
            self.db.update(data, self.query.id == music_id)

    def delete_data(self, music_id: str):
        """删除音频"""
        with self.thread_lock:
            self.db.remove(self.query.id == music_id)


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

    def get_data(self, set_id: str) -> dict:
        """获取合集详情"""
        with self.thread_lock:
            data = self.db.get(self.query.id == set_id)
            return data

    def search_data(self, page: int, limit: int):
        """获取合集列表"""
        with self.thread_lock:
            datas = self.db.all()
            # 计算总数
            total = len(datas)
            # 分页
            if page is not None and limit is not None:
                datas = datas[page * limit:(page + 1) * limit]
            for i, data in enumerate(datas):
                datas[i] = extra_data_by_list(data, ["id", "name"])
            return datas, total

    def add_data(self, data: dict):
        """新增合集"""
        data = extra_data_by_list(data, ["name"])
        data["id"] = route_utils.gen_id()
        data["list"] = []
        with self.thread_lock:
            self.db.insert(data)

    def delete_data(self, set_id: str):
        """删除合集"""
        with self.thread_lock:
            self.db.remove(self.query.id == set_id)

    def edit_data(self, set_id: str, input_data: dict):
        """编辑合集"""
        input_data = extra_data_by_list(input_data, ["name"])
        with self.thread_lock:
            data = self.db.get(self.query.id == set_id)
            data.update(input_data)
            self.db.update(data, self.query.id == set_id)

    def add_music(self, set_id: str, music_id: str):
        """添加音频到合集"""
        with self.thread_lock:
            data = self.db.get(self.query.id == set_id)
            if data is None:
                return
            if music_id in data["list"]:
                return
            data["list"].append(music_id)
            self.db.update(data, self.query.id == set_id)

    def remove_music(self, set_id: str, music_id: str):
        """将音频移除出合集"""
        with self.thread_lock:
            data = self.db.get(self.query.id == set_id)
            if data is None:
                return
            if music_id not in data["list"]:
                return
            data["list"].remove(music_id)
            print(data)
            self.db.update(data, self.query.id == set_id)

    def clear_by_music(self, music_id: str):
        """清空所有合集关该音频的内容"""
        with self.thread_lock:
            for data in self.db.all():
                if music_id in data["list"]:
                    data["list"].remove(music_id)
                    self.db.update(data, self.query.id == data["id"])  # type:ignore
