import mimetypes
import os.path
import urllib

from flask import Blueprint, request, Response, jsonify
from werkzeug.datastructures import FileStorage

from core.common.file_utils import get_file_ext, get_stream_io, is_path_within_folder
from core.common.route_utils import gen_fail_response, is_str_empty, gen_id, gen_success_response, is_key_str_empty
from core.config.config import get_config_path
from core.database.file_system import FileType
from core.log.log import logger
from core.route.route_data import ReportInfo, FsServer, FsConfig, gen_prefix_api
from core.route.user import verify_token

FileSystemBp = Blueprint("file_system", __name__)


@FileSystemBp.route("/sources", methods=["GET"])
def download_static_file():
    """下载静态资源文件"""
    filename = request.args.get('filename')
    if is_str_empty(filename):
        return gen_fail_response(ReportInfo["012"], 404)
    static_path = get_config_path("file_static_path")
    file_path = os.path.join(static_path, filename)
    if os.path.exists(file_path) and os.path.isfile(file_path) and is_path_within_folder(static_path, file_path):
        try:
            mime_type, _ = mimetypes.guess_type(file_path)
            return Response(get_stream_io(file_path), mimetype=mime_type, headers={
                "Transfer-Encoding": "chunked",
                "Content-Type": "application/octet-stream"
            })
        except Exception as e:
            return gen_fail_response(str(e), 500)
    return gen_fail_response(ReportInfo["012"], 404)


@FileSystemBp.route(gen_prefix_api("/files/<file_id>/download"), methods=["GET"])
def download_file(file_id: str):
    """下载文件"""
    # verify
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result

    if is_str_empty(file_id):
        return gen_fail_response(ReportInfo["012"])
    if not FsServer.is_file_exist(file_id):
        return gen_fail_response(ReportInfo["012"])
    data = FsServer.get_data(file_id)
    file_path = data["path"]
    filename = "%s.%s" % (data["name"], get_file_ext(file_path))
    if os.path.exists(file_path) and os.path.isfile(file_path):
        try:
            mime_type, _ = mimetypes.guess_type(file_path)
            return Response(get_stream_io(file_path), mimetype=mime_type, headers={
                "Content-Disposition": "attachment;filename=%s" % urllib.parse.quote(filename),
                "Content-Type": "application/octet-stream"
            })
        except Exception as e:
            return gen_fail_response(str(e), 500)
    return gen_fail_response(ReportInfo["012"])


@FileSystemBp.route(gen_prefix_api("/files"), methods=["POST"])
def add_file():
    """新增文件"""
    # verify
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result

    # 获取并检查数据
    file = request.files.get("file")
    if not file:
        return gen_fail_response(ReportInfo["007"])
    if not check_file_ext(file):
        return gen_fail_response(ReportInfo["008"])
    parent_id = request.form.get("parentId")
    if not FsServer.is_folder_exist(parent_id):
        return gen_fail_response(ReportInfo["009"])
    filename = request.form.get("name")
    if is_str_empty(filename):
        return gen_fail_response(ReportInfo["005"])

    # 保存文件
    file_ext = get_file_ext(file.filename)
    local_name = "%s.%s" % (gen_id(), file_ext)
    filepath = os.path.join(get_config_path("file_save_path"), local_name)
    try:
        file.save(filepath)
        file_size = os.path.getsize(filepath)
    except Exception as e:
        logger.error("保存文件%s失败：%s" % (file.filename, e))
        return gen_fail_response(ReportInfo["004"])

    db_data = {
        "name": filename,
        "type": FileType.FILE,
        "parentId": parent_id,
        "path": filepath,
        "size": file_size
    }
    FsServer.add(db_data)
    return gen_success_response(ReportInfo["006"])


@FileSystemBp.route(gen_prefix_api("/folders"), methods=["POST"])
def add_folder():
    """新增文件夹"""
    # verify
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result
    data = request.json
    if is_key_str_empty(data, "name"):
        return gen_fail_response(ReportInfo["013"])
    if is_key_str_empty(data, "parentId"):
        return gen_fail_response(ReportInfo["009"])
    parent_id = data["parentId"]
    if not FsServer.is_folder_exist(parent_id):
        return gen_fail_response(ReportInfo["009"])
    db_data = {
        "name": data["name"],
        "type": FileType.FOLDER,
        "parentId": parent_id
    }
    FsServer.add(db_data)
    return gen_success_response(ReportInfo["006"])


@FileSystemBp.route(gen_prefix_api("/folders/<folder_id>"), methods=["PUT"])
def edit_folder(folder_id: str):
    """编辑文件夹"""
    # verify
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result
    data = request.json
    if is_key_str_empty(data, "name"):
        return gen_fail_response(ReportInfo["013"])
    if is_str_empty(folder_id) or not FsServer.is_folder_exist(folder_id):
        return gen_fail_response(ReportInfo["009"])
    if is_key_str_empty(data, "parentId") or not FsServer.is_folder_exist(data["parentId"]):
        return gen_fail_response(ReportInfo["009"])
    if data["parentId"] == folder_id:
        return gen_fail_response(ReportInfo["015"])
    FsServer.edit_folder(folder_id, data)
    return gen_success_response(ReportInfo["014"])


@FileSystemBp.route(gen_prefix_api("/files/<file_id>"), methods=["PUT"])
def edit_file(file_id: str):
    """编辑文件"""
    # verify
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result
    data = request.json
    if is_key_str_empty(data, "name"):
        return gen_fail_response(ReportInfo["013"])
    if is_str_empty(file_id) or not FsServer.is_file_exist(file_id):
        return gen_fail_response(ReportInfo["012"])
    if is_key_str_empty(data, "parentId") or not FsServer.is_folder_exist(data["parentId"]):
        return gen_fail_response(ReportInfo["009"])
    FsServer.edit_file(file_id, data)
    return gen_success_response(ReportInfo["014"])


@FileSystemBp.route(gen_prefix_api("/folders/<folder_id>"), methods=["GET"])
def get_folder_content(folder_id: str):
    """获取文件"""
    # verify
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result
    if is_str_empty(folder_id) or not FsServer.is_folder_exist(folder_id):
        return gen_fail_response(ReportInfo["009"])
    search_type = request.args.get("type")
    page = request.args.get("_page")
    if page is not None:
        page = int(page)
    limit = request.args.get("_limit")
    if limit is not None:
        limit = int(limit)
    return jsonify(FsServer.get_folder_detail(folder_id, search_type, page, limit))


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


@FileSystemBp.route(gen_prefix_api("/files/<file_id>"), methods=["DELETE"])
def delete_file(file_id: str):
    """删除文件"""
    # verify
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result
    if is_str_empty(file_id) or not FsServer.is_file_exist(file_id):
        return gen_fail_response(ReportInfo["012"])
    FsServer.delete_file(file_id)
    return gen_success_response(ReportInfo["016"])


@FileSystemBp.route(gen_prefix_api("/folders/<folder_id>"), methods=["DELETE"])
def delete_folder(folder_id: str):
    """删除文件夹"""
    # verify
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result
    if is_str_empty(folder_id) or not FsServer.is_folder_exist(folder_id):
        return gen_fail_response(ReportInfo["009"])
    FsServer.delete_folder(folder_id)
    return gen_success_response(ReportInfo["016"])