from typing import Optional

import flask
from flask import Response

from core.common.file_utils import load_json_data
from core.common.route_utils import get_bearer_token, is_str_empty, gen_fail_response, get_client_ip
from core.config.config import get_config_path
from core.database.file_system import FileSystemServer
from core.database.user import SessionServer
from core.database.user import UserServer

ReportInfo = load_json_data(get_config_path("lang_config_path"))

FsServer = FileSystemServer(get_config_path("file_sys_db_path"))
FsConfig = load_json_data(get_config_path("file_sys_config_path"))

UsrServer = UserServer(get_config_path("user_db_path"))

SessServer = SessionServer(get_config_path("session_db_path"))

API_PREFIX = "/api/v1"


def gen_prefix_api(api_str: str) -> str:
    """生成添加了前缀的api路由"""
    return API_PREFIX + api_str


def get_ext_key(file_ext: str) -> Optional[str]:
    """获取后缀对应文件类型键值"""
    file_ext = file_ext.lower()
    for ext_key, ext_list in FsConfig["file_white_list"].items():
        if file_ext in ext_list:
            return ext_key


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
