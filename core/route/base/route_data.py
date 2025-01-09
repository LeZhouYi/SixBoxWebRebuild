import re
from functools import wraps
from typing import Optional

import flask
from flask import Response, request
from werkzeug.datastructures import FileStorage

from core.common.file_utils import load_json_data, get_file_ext
from core.common.route_utils import get_bearer_token, is_str_empty, gen_fail_response, get_client_ip
from core.config.config import get_config_path
from core.database.file_system import FileSystemServer, FileType
from core.database.music import MusicServer, MusicSetServer
from core.database.user import SessionServer
from core.database.user import UserServer

ReportInfo = load_json_data(get_config_path("lang_config_path"))

DbConfig = load_json_data(get_config_path("database_config_path"))

FsConfig = load_json_data(get_config_path("file_sys_config_path"))
FsServer = FileSystemServer(get_config_path("file_sys_db_path"), FsConfig)

UsrServer = UserServer(get_config_path("user_db_path"), DbConfig)

SessServer = SessionServer(get_config_path("session_db_path"))

MscServer = MusicServer(get_config_path("music_db_path"))
MscSetServer = MusicSetServer(get_config_path("music_set_db_path"), DbConfig)

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


def verify_page_limit(request_in: flask.request) -> tuple[Response, int] | tuple[int, int]:
    """验证Page和Limit，验证成功则返回[page,limit]"""
    page = request_in.args.get("_page")
    if is_str_empty(page):
        return gen_fail_response(ReportInfo["017"])
    limit = request_in.args.get("_limit")
    if is_str_empty(limit):
        return gen_fail_response(ReportInfo["018"])
    if int(page) < 0:
        return gen_fail_response(ReportInfo["019"])
    if int(limit) < 1:
        return gen_fail_response(ReportInfo["020"])
    return int(page), int(limit)


def is_default_folder(folder_id: str) -> bool:
    """判断是否是默认文件夹"""
    for data in FsConfig["default_folders"]:
        if folder_id in data:
            return True
    return False


def token_required(func):
    """添加Token校验"""

    @wraps(func)
    def decorated(*args, **kwargs):
        verify_result = verify_token(request)
        if isinstance(verify_result[0], Response):
            return verify_result
        return func(*args, **kwargs)

    return decorated
