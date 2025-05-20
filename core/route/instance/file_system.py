import mimetypes
import os.path
import urllib.parse

from flask import Blueprint, jsonify, request

from core.common.file_utils import get_stream_io, is_path_within_folder, get_range_stream_io
from core.common.route_utils import gen_id, gen_success_response, is_key_str_empty
from core.log.log import logger
from core.route.base.route_data import *
from core.route.base.route_decorate import token_required, page_args_required

FileSystemBp = Blueprint("file_system", __name__)


@FileSystemBp.route("/sources", methods=["GET"])
def download_static_file():
    """下载静态资源文件"""
    filename = request.args.get('filename')
    if is_str_empty(filename):
        return gen_fail_response(ReportInfo["012"], 404)
    static_path = get_config_path("file_static")
    filepath = os.path.join(static_path, filename)
    if os.path.exists(filepath) and os.path.isfile(filepath) and is_path_within_folder(static_path, filepath):
        try:
            mime_type, _ = mimetypes.guess_type(filepath)
            return Response(get_stream_io(filepath), mimetype=mime_type, headers={
                "Transfer-Encoding": "chunked"
            })
        except Exception as e:
            return gen_fail_response(str(e), 500)
    return gen_fail_response(ReportInfo["012"], 404)


@FileSystemBp.route(gen_prefix_api("/files/<file_id>/download"), methods=["GET"])
@token_required
def download_file(file_id: str):
    """下载文件"""
    if is_str_empty(file_id):
        return gen_fail_response(ReportInfo["012"])
    if not FileSystemDB.is_file_exist(file_id):
        return gen_fail_response(ReportInfo["012"])
    data = FileSystemDB.get_data(file_id)
    filepath = get_real_filepath(data["path"])
    filename = "%s.%s" % (data["name"], get_file_ext(filepath))
    if os.path.exists(filepath) and os.path.isfile(filepath):
        try:
            mime_type, _ = mimetypes.guess_type(filepath)
            return Response(get_stream_io(filepath), mimetype=mime_type, headers={
                "Content-Disposition": "attachment;filename=%s" % urllib.parse.quote(filename)
            })
        except Exception as e:
            return gen_fail_response(str(e), 500)
    return gen_fail_response(ReportInfo["012"])


@FileSystemBp.route(gen_prefix_api("/videos/<file_id>/play"), methods=["GET"])
@token_required
def play_video(file_id: str):
    """播放视频"""
    if is_str_empty(file_id):
        return gen_fail_response(ReportInfo["012"])
    if not FileSystemDB.is_file_exist(file_id):
        return gen_fail_response(ReportInfo["012"])
    data = FileSystemDB.get_data(file_id)
    filepath = data["path"]
    filename = "%s.%s" % (data["name"], get_file_ext(filepath))
    if os.path.exists(filepath) and os.path.isfile(filepath):
        try:
            if data["type"] == FileType.VIDEO:
                return get_range_stream_io(request, filepath, filename)
        except Exception as e:
            return gen_fail_response(str(e), 500)
    return gen_fail_response(ReportInfo["012"])


@FileSystemBp.route(gen_prefix_api("/files"), methods=["POST"])
@token_required
def add_file():
    """新增文件"""
    # 获取并检查数据
    file = request.files.get("file")
    if not file:
        return gen_fail_response(ReportInfo["007"])
    if not check_file_ext(file):
        return gen_fail_response(ReportInfo["008"])
    parent_id = request.form.get("parentId")
    if not FileSystemDB.is_folder_exist(parent_id):
        return gen_fail_response(ReportInfo["009"])
    filename = request.form.get("name")
    if is_str_empty(filename):
        return gen_fail_response(ReportInfo["005"])

    # 保存文件
    file_ext = get_file_ext(file.filename)
    local_name = "%s.%s" % (gen_id(), file_ext)
    filepath = os.path.join(get_config_path("file_save"), local_name)
    try:
        file.save(filepath)
    except Exception as e:
        logger.error("保存文件%s失败：%s" % (file.filename, e))
        return gen_fail_response(ReportInfo["004"])

    ext_key = get_ext_key(file_ext)

    db_data = FileSystemDB.gen_add_dict(filename, ext_key, parent_id, filepath)
    FileSystemDB.add(db_data)
    return gen_success_response(ReportInfo["006"])


@FileSystemBp.route(gen_prefix_api("/folders"), methods=["POST"])
@token_required
def add_folder():
    """新增文件夹"""
    data = request.json
    if is_key_str_empty(data, "name"):
        return gen_fail_response(ReportInfo["013"])
    if is_key_str_empty(data, "parentId"):
        return gen_fail_response(ReportInfo["009"])
    parent_id = data["parentId"]
    if not FileSystemDB.is_folder_exist(parent_id):
        return gen_fail_response(ReportInfo["009"])
    db_data = {
        "name": data["name"],
        "type": FileType.FOLDER,
        "parentId": parent_id
    }
    FileSystemDB.add(db_data)
    return gen_success_response(ReportInfo["006"])


@FileSystemBp.route(gen_prefix_api("/folders/<folder_id>"), methods=["PUT"])
@token_required
def edit_folder(folder_id: str):
    """编辑文件夹"""
    data = request.json
    if is_key_str_empty(data, "name"):
        return gen_fail_response(ReportInfo["013"])
    if is_str_empty(folder_id) or not FileSystemDB.is_folder_exist(folder_id):
        return gen_fail_response(ReportInfo["009"])
    if is_key_str_empty(data, "parentId") or not FileSystemDB.is_folder_exist(data["parentId"]):
        return gen_fail_response(ReportInfo["009"])
    if data["parentId"] == folder_id:
        return gen_fail_response(ReportInfo["015"])
    FileSystemDB.edit_folder(folder_id, data)
    return gen_success_response(ReportInfo["014"])


@FileSystemBp.route(gen_prefix_api("/files/<file_id>"), methods=["PUT"])
@token_required
def edit_file(file_id: str):
    """编辑文件"""
    data = request.json
    if is_key_str_empty(data, "name"):
        return gen_fail_response(ReportInfo["013"])
    if is_str_empty(file_id) or not FileSystemDB.is_file_exist(file_id):
        return gen_fail_response(ReportInfo["012"])
    if is_key_str_empty(data, "parentId") or not FileSystemDB.is_folder_exist(data["parentId"]):
        return gen_fail_response(ReportInfo["009"])
    FileSystemDB.edit_file(file_id, data)
    return gen_success_response(ReportInfo["014"])


@FileSystemBp.route(gen_prefix_api("/folders/<folder_id>"), methods=["GET"])
@token_required
@page_args_required
def get_folder_content(folder_id: str):
    """获取文件夹"""
    if is_str_empty(folder_id) or not FileSystemDB.is_folder_exist(folder_id):
        return gen_fail_response(ReportInfo["009"])
    search_type = request.args.get("type")
    page = int(request.args.get("_page"))
    limit = int(request.args.get("_limit"))
    return jsonify(FileSystemDB.get_folder_detail(folder_id, search_type, page, limit))


@FileSystemBp.route(gen_prefix_api("/files/<file_id>"), methods=["DELETE"])
@token_required
def delete_file(file_id: str):
    """删除文件"""
    if is_str_empty(file_id) or not FileSystemDB.is_file_exist(file_id):
        return gen_fail_response(ReportInfo["012"])
    FileSystemDB.delete_file(file_id)
    return gen_success_response(ReportInfo["016"])


@FileSystemBp.route(gen_prefix_api("/folders/<folder_id>"), methods=["DELETE"])
@token_required
def delete_folder(folder_id: str):
    """删除文件夹"""
    if is_str_empty(folder_id) or not FileSystemDB.is_folder_exist(folder_id):
        return gen_fail_response(ReportInfo["009"])
    if is_default_folder(folder_id):
        return gen_fail_response(ReportInfo["031"])
    FileSystemDB.delete_folder(folder_id)
    return gen_success_response(ReportInfo["016"])


@FileSystemBp.route(gen_prefix_api("/files"), methods=["GET"])
@token_required
@page_args_required
def search_file():
    """搜索文件和文件夹"""
    page = int(request.args.get("_page"))
    limit = int(request.args.get("_limit"))
    search_name = request.args.get("nameLike")
    if is_str_empty(search_name):
        return gen_fail_response(ReportInfo["021"])
    return jsonify(FileSystemDB.search_file(search_name, page, limit))


@FileSystemBp.route(gen_prefix_api("/filesTidyUp"), methods=["GET"])
@token_required
def tidy_up_file():
    """整理文件，调整文件类型"""
    FileSystemDB.tidy_up_data(FileSystemConfig["file_white_list"])
    folder_path = get_config_path("file_save")
    for file_name in os.listdir(folder_path):
        if not FileSystemDB.is_exist_by_filename(file_name):
            os.remove(os.path.join(folder_path, file_name))
    return gen_success_response(ReportInfo["022"])


@FileSystemBp.route(gen_prefix_api("/files/<file_id>/near"), methods=["GET"])
@token_required
def get_near_file(file_id: str):
    """获取相邻同类型的文件"""
    if is_str_empty(file_id):
        return gen_fail_response(ReportInfo["012"])
    if not FileSystemDB.is_file_exist(file_id):
        return gen_fail_response(ReportInfo["012"])
    return jsonify(FileSystemDB.get_near_file(file_id))
