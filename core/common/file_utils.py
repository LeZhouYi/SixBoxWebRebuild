import json
import mimetypes
import os.path
import re
import sys
import urllib.parse
from os import PathLike
from typing import Optional, Generator, Any

import flask
from flask import Response


def get_file_ext(filename: str) -> str:
    """
    获取文件名后缀
    :param filename:
    :return:
    """
    if filename.find(".") > -1:
        return filename.rsplit(".", 1)[1]
    return ""


def get_local_path(relative_path: PathLike | str) -> str:
    """
    :param relative_path: 相对路径
    :return: 返回本地实际的绝对路径
    """
    root_path = os.path.dirname(os.path.realpath(sys.argv[0]))
    return os.path.join(root_path, relative_path)


def load_json_data(filepath: str) -> Optional[dict]:
    """
    读取Json数据
    :param filepath: 文件相对路径
    :return Json数据
    """
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as file:
            return json.load(file)


def get_file_chunk(filepath: str, start: int = None):
    end = None
    with open(filepath, 'rb') as file:
        file_size = os.path.getsize(filepath)
        while True:
            print(start)
            print(file_size)
            if start is None:
                start = 0
            if end is not None:
                start = end
            if start >= file_size - 1:
                break
            end = start + 1024 * 1024
            if end > file_size - 1:
                end = file_size - 1

            file.seek(start)
            # 发送文件的部分内容
            data = file.read(end - start + 1)
            yield data


def get_range_stream_io(request: flask.request, filepath: str, filename: str):
    range_header = request.headers.get('Range', None)
    start = 0
    file_size = os.path.getsize(filepath)
    if range_header:
        match = re.search(r'(\d+)-(\d*)', range_header)
        groups = match.groups()
        if groups[0]:
            start = int(groups[0])
    end = min(start + 1024 * 1024, file_size-1)
    length = end - start + 1
    mime_type, _ = mimetypes.guess_type(filepath)
    return Response(get_file_chunk(filepath, start), status=206, mimetype=mime_type, content_type=mime_type,
                    direct_passthrough=True,
                    headers={
                        "Content-Range": "bytes %s-%s/%s" % (start, end, file_size),
                        "Accept-Ranges": "bytes",
                        "Content-Length": length,
                        "Content-Disposition": "attachment;filename=%s" % urllib.parse.quote(filename)
                    })


def get_stream_io(filepath: str, chunk_size: int = 1024) -> Generator[bytes, Any, None]:
    """获取文件流式传输流"""
    with open(filepath, "rb") as file:
        while True:
            data = file.read(chunk_size)
            if not data:
                break
            yield data


def is_path_within_folder(filepath, folder_path) -> bool:
    """
    判断文件是否在指定文件夹内
    @param filepath:
    @param folder_path:
    @return: true表示在文件夹内
    """
    try:
        relative_path = os.path.relpath(folder_path, filepath)
    except ValueError:
        return False
    return not relative_path.startswith("..")


def get_svg_content(filepath):
    """获取本地的svg"""
    with open(filepath, 'r', encoding='utf-8') as file:
        svg_content = file.read()
    return svg_content
