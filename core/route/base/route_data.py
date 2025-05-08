import os
import re
from os import PathLike
from typing import Optional, Union

import flask
from flask import Response
from werkzeug.datastructures import FileStorage

from core.common.file_utils import load_json_data, get_file_ext
from core.common.route_utils import get_bearer_token, is_str_empty, gen_fail_response, get_client_ip
from core.config.config import get_config_path
from core.database.file_system import FileSystemServer, FileType
from core.database.music import MusicServer, MusicSetServer
from core.database.user import SessionServer
from core.database.user import UserServer

ReportInfo = load_json_data(get_config_path("lang_config"))

DbConfig = load_json_data(get_config_path("database_config"))

FsConfig = load_json_data(get_config_path("file_sys_config"))
FsServer = FileSystemServer(get_config_path("file_sys_db"), FsConfig)

UsrServer = UserServer(get_config_path("user_db"), DbConfig)

SessServer = SessionServer(get_config_path("session_db"))

MscServer = MusicServer(get_config_path("music_db"))
MscSetServer = MusicSetServer(get_config_path("music_set_db"), DbConfig)

API_PREFIX = "/api/v1"


def gen_prefix_api(api_str: str) -> str:
    """生成添加了前缀的api路由"""
    return API_PREFIX + api_str


def get_ext_key(file_ext: str) -> Optional[str]:
    """获取后缀对应文件类型键值"""
    file_ext = file_ext.lower()
    for ext_key, ext_list in FsConfig["file_white_list"].items():
        if file_ext in ext_list:
            if not re.match(r"^\d+$", ext_key):
                return FileType.FILE
            return ext_key


def check_file_ext(file: FileStorage) -> bool:
    """
    检查文件类型是否在白名单中
    :param file:
    :return: False表示文件不符合要求
    """
    white_list = FsConfig["file_white_list"]
    if file.filename is None:
        return False
    file_ext = get_file_ext(file.filename).lower()
    for _, value in white_list.items():
        if file_ext in value:
            return True
    return False


def verify_token(request_in: flask.request) -> tuple[Response, int] | tuple[str, str]:
    """验证Token"""
    token = get_bearer_token(request_in)
    if token is None:
        token = request_in.args.get("token")
    if is_str_empty(token):
        return gen_fail_response(ReportInfo["010"], 401)
    client_ip = get_client_ip(request_in)
    result, data_or_info = SessServer.verify(token, client_ip)
    if result is False:
        if data_or_info == "TOKEN INVALID":
            return gen_fail_response(ReportInfo["010"], 401)
        elif data_or_info == "TOKEN EXPIRED":
            return gen_fail_response(ReportInfo["011"], 401)
    return data_or_info["userId"], client_ip


def is_default_folder(folder_id: str) -> bool:
    """判断是否是默认文件夹"""
    for data in FsConfig["default_folders"]:
        if folder_id in data:
            return True
    return False


def get_real_filepath(filepath: Union[PathLike | str]) -> Union[PathLike | str]:
    """获取真实路径"""
    filepath = str(filepath).split("/")[-1]
    filepath = filepath.split("\\")[-1]
    return os.path.join(get_config_path("file_save"), filepath)
