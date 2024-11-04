import json
import os.path
import sys
from os import PathLike
from typing import Optional, Generator, Any


def get_file_ext(filename: str) -> str:
    """
    获取文件名后缀
    :param filename:
    :return:
    """
    return filename.rsplit('.', 1)[1]


def get_local_path(relative_path: PathLike | str) -> str:
    """
    :param relative_path: 相对路径
    :return: 返回本地实际的绝对路径
    """
    root_path = os.path.dirname(os.path.realpath(sys.argv[0]))
    return os.path.join(root_path, relative_path)


def load_json_data(file_path: str) -> Optional[dict]:
    """
    读取Json数据
    :param file_path: 文件相对路径
    :return Json数据
    """
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)


def get_stream_io(file_path: str, chunk_size: int = 1024) -> Generator[bytes, Any, None]:
    """获取文件流式传输流"""
    with open(file_path, "rb") as file:
        while True:
            data = file.read(chunk_size)
            if not data:
                break
            yield data
