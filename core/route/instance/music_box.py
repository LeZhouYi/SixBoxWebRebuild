import os

from flask import Blueprint, render_template, request, jsonify

from core.common.route_utils import gen_id, gen_success_response
from core.log.log import logger
from core.route.base.route_data import *
from core.route.base.route_decorate import token_required, page_args_required

MusicBoxBp = Blueprint("music_box", __name__)


@MusicBoxBp.route("/music.html")
def music_page():
    return render_template("music.html")


@MusicBoxBp.route(gen_prefix_api("/musics"), methods=["POST"])
@token_required
def add_music():
    """新增音频"""
    # 获取并检查数据
    file = request.files.get("file")
    if not file:
        return gen_fail_response(ReportInfo["007"])
    ext_key = get_ext_key(get_file_ext(file.filename))
    if ext_key != FileType.MUSIC:
        return gen_fail_response(ReportInfo["008"])
    music_name = request.form.get("name")
    if is_str_empty(music_name):
        return gen_fail_response(ReportInfo["005"])
    singer = request.form.get("singer")
    if is_str_empty(singer):
        return gen_fail_response(ReportInfo["032"])
    set_id = request.form.get("setId")
    if is_str_empty(set_id):
        return gen_fail_response(ReportInfo["033"])
    if not MscSetServer.is_exist(set_id):
        return gen_fail_response(ReportInfo["034"])
    album = request.files.get("album")
    tags = request.files.get("tags")

    # 保存文件
    file_ext = get_file_ext(file.filename)
    local_name = "%s.%s" % (gen_id(), file_ext)
    filepath = os.path.join(get_config_path("file_save_path"), local_name)
    try:
        file.save(filepath)
    except Exception as e:
        logger.error("保存文件%s失败：%s" % (file.filename, e))
        return gen_fail_response(ReportInfo["004"])

    filename = "%s-%s" % (singer, music_name)
    db_data = FsServer.gen_add_dict(
        filename, ext_key, FsConfig["music_folder_id"], filepath
    )
    file_id = FsServer.add(db_data)
    music_data = MscServer.gen_add_dict(music_name, file_id, singer, set_id, album, tags)
    MscServer.add(music_data)
    return gen_success_response(ReportInfo["006"])


@MusicBoxBp.route(gen_prefix_api("/musicSets/<set_id>"), methods=["GET"])
@token_required
@page_args_required
def get_music_set(set_id: str):
    """获取合集详情"""
    if is_str_empty(set_id):
        return gen_fail_response(ReportInfo["033"])
    if not MscSetServer.is_exist(set_id):
        return gen_fail_response(ReportInfo["034"])
    page = int(request.args.get("_page"))
    limit = int(request.args.get("_limit"))
    music_set_data = MscSetServer.get_data(set_id)
    music_list, total = MscServer.search_data(set_id, page, limit)
    music_set_data["contents"] = music_list
    music_set_data["total"] = total
    return jsonify(music_set_data)
