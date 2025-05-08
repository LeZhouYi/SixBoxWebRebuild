from flask import Blueprint, jsonify, request

from core.common.route_utils import is_key_str_empty, gen_id, gen_success_response, extra_data_by_list
from core.log.log import logger
from core.route.base.route_data import *
from core.route.base.route_decorate import token_required

TinyMceBp = Blueprint("tinymce", __name__)


@TinyMceBp.route(gen_prefix_api("/texts"), methods=["POST"])
@token_required
def add_text():
    """新增富文本"""
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
    filepath = os.path.join(get_config_path("file_save"), local_name)
    try:
        with open(filepath, "w", encoding="utf-8") as file:
            file.write(data["content"])
    except Exception as e:
        logger.error("保存文件%s失败：%s" % (filepath, e))
        return gen_fail_response(ReportInfo["025"])
    db_data = FsServer.gen_add_dict(data["name"], FileType.MCE_TEXT, parent_id, filepath)
    FsServer.add(db_data)
    return gen_success_response(ReportInfo["006"])


@TinyMceBp.route(gen_prefix_api("/texts/<file_id>"), methods=["GET"])
@token_required
def get_text(file_id: str):
    """获取文本"""
    if is_str_empty(file_id) or not FsServer.is_file_exist(file_id):
        return gen_fail_response(ReportInfo["012"])
    data = FsServer.get_data(file_id)
    filepath = get_real_filepath(data["path"])
    data = extra_data_by_list(data, FsServer.key_list)
    try:
        with open(filepath, "r", encoding="utf-8") as file:
            data["content"] = file.read()
    except Exception as e:
        logger.error("读取文件%s失败：%s" % (filepath, e))
        return gen_fail_response(ReportInfo["026"])
    return jsonify(data)


@TinyMceBp.route(gen_prefix_api("/texts/<file_id>"), methods=["PUT"])
@token_required
def edit_text(file_id: str):
    """编辑文本"""
    if is_str_empty(file_id) or not FsServer.is_file_exist(file_id):
        return gen_fail_response(ReportInfo["012"])
    before_data = FsServer.get_data(file_id)
    filepath = get_real_filepath(before_data["path"])
    if not os.path.exists(filepath):
        return gen_fail_response(ReportInfo["012"])
    now_data = request.json
    if is_key_str_empty(now_data, "name"):
        return gen_fail_response(ReportInfo["023"])
    if is_key_str_empty(now_data, "parentId"):
        return gen_fail_response(ReportInfo["009"])
    parent_id = now_data["parentId"]
    if not FsServer.is_folder_exist(parent_id):
        return gen_fail_response(ReportInfo["009"])
    if is_key_str_empty(now_data, "content"):
        return gen_fail_response(ReportInfo["024"])
    try:
        with open(filepath, "w", encoding="utf-8") as file:
            file.write(now_data["content"])
        file_size = os.path.getsize(filepath)
    except Exception as e:
        logger.error("写入文件%s失败：%s" % (filepath, e))
        return gen_fail_response(ReportInfo["027"])
    FsServer.edit_file(file_id, {
        "name": now_data["name"],
        "parentId": parent_id,
        "size": file_size
    })
    return gen_success_response(ReportInfo["014"])
