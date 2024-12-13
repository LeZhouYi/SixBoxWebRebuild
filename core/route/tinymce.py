import os

from flask import Blueprint, Response, request

from core.common.route_utils import is_key_str_empty, gen_fail_response, gen_id, gen_success_response
from core.config.config import get_config_path
from core.database.file_system import FileType
from core.log.log import logger
from core.route.route_data import gen_prefix_api, verify_token, ReportInfo, FsServer

TinyMceBp = Blueprint("tinymce", __name__)


@TinyMceBp.route(gen_prefix_api("/texts"), methods=["POST"])
def add_text():
    """新增富文本"""
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result
    data = request.json
    if is_key_str_empty(data, "name"):
        return gen_fail_response(ReportInfo["023"])
    if is_key_str_empty(data, "parentId"):
        return gen_fail_response(ReportInfo["009"])
    parent_id = data["parentId"]
    if not FsServer.is_folder_exist(parent_id):
        return gen_fail_response(ReportInfo["009"])
    if is_key_str_empty(data, "content"):
        return gen_fail_response(ReportInfo["024"])

    local_name = "%s.%s" % (gen_id(), "html")
    filepath = os.path.join(get_config_path("file_save_path"), local_name)
    try:
        with open(filepath, "w", encoding="utf-8") as file:
            file.write(data["content"])
        file_size = os.path.getsize(filepath)
    except Exception as e:
        logger.error("保存文件%s失败：%s" % (filepath, e))
        return gen_fail_response(ReportInfo["025"])
    db_data = {
        "name": data["name"],
        "type": FileType.MCE_TEXT,
        "parentId": parent_id,
        "path": filepath,
        "size": file_size
    }
    FsServer.add(db_data)
    return gen_success_response(ReportInfo["006"])