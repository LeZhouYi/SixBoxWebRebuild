from flask import Blueprint, render_template, request, jsonify

from core.common.route_utils import gen_id, gen_success_response, is_key_str_empty, extra_data_by_list
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
    if not MusicSetDB.is_exist(set_id):
        return gen_fail_response(ReportInfo["034"])
    album = request.form.get("album")
    tags = request.form.get("tags")

    # 保存文件
    file_ext = get_file_ext(file.filename)
    local_name = "%s.%s" % (gen_id(), file_ext)
    filepath = os.path.join(get_config_path("file_save"), local_name)
    try:
        file.save(filepath)
    except Exception as e:
        logger.error("保存文件%s失败：%s" % (file.filename, e))
        return gen_fail_response(ReportInfo["004"])

    filename = "%s-%s" % (singer, music_name)
    db_data = FileSystemDB.gen_add_dict(
        filename, ext_key, FileSystemConfig["music_folder_id"], filepath
    )
    file_id = FileSystemDB.add(db_data)
    music_data = MusicDB.gen_add_dict(music_name, file_id, singer, album, tags)
    music_id = MusicDB.add(music_data)
    MusicSetDB.add_music(set_id, music_id)
    return gen_success_response(ReportInfo["006"])


@MusicBoxBp.route(gen_prefix_api("/musicSets/<set_id>"), methods=["GET"])
@token_required
@page_args_required
def get_music_set(set_id: str):
    """获取合集详情"""
    if is_str_empty(set_id):
        return gen_fail_response(ReportInfo["033"])
    if not MusicSetDB.is_exist(set_id):
        return gen_fail_response(ReportInfo["034"])

    page = int(request.args.get("_page"))
    limit = int(request.args.get("_limit"))

    music_set_data = MusicSetDB.get_data(set_id)

    if is_key_str_empty(music_set_data, "list"):
        music_list = []
    else:
        music_list = music_set_data["list"]
    music_set_data["total"] = len(music_list)
    music_list = music_list[page * limit:(page + 1) * limit]

    music_set_data["contents"] = []
    for music_id in music_list:
        data = MusicDB.get_data(music_id)
        if data is not None:
            music_set_data["contents"].append(data)
    music_set_data = extra_data_by_list(music_set_data, ["id", "name", "total", "contents"])
    return jsonify(music_set_data)


@MusicBoxBp.route(gen_prefix_api("/musicSets"), methods=["GET"])
@token_required
@page_args_required
def get_music_sets():
    """获取合集列表"""
    page = int(request.args.get("_page"))
    limit = int(request.args.get("_limit"))
    data, total = MusicSetDB.search_data(page, limit)
    return jsonify(data), 200, {
        "X-Total-Count": total
    }


@MusicBoxBp.route(gen_prefix_api("/musicSets"), methods=["POST"])
@token_required
def add_collect():
    """新增合集"""
    data = request.json
    if is_key_str_empty(data, "name"):
        return gen_fail_response(ReportInfo["035"])
    MusicSetDB.add_data(data)
    return gen_success_response(ReportInfo["006"])


@MusicBoxBp.route(gen_prefix_api("/musicSets/<collect_id>"), methods=["PUT"])
@token_required
def edit_collect(collect_id: str):
    """编辑合集"""
    input_data = request.json
    if is_key_str_empty(input_data, "name"):
        return gen_fail_response(ReportInfo["035"])
    if not MusicSetDB.is_exist(collect_id):
        return gen_fail_response(ReportInfo["034"])
    MusicSetDB.edit_data(collect_id, input_data)
    return gen_success_response(ReportInfo["014"])


@MusicBoxBp.route(gen_prefix_api("/musics/<music_id>"), methods=["PUT"])
@token_required
def edit_music(music_id: str):
    """编辑音频"""
    input_data = request.json
    if is_key_str_empty(input_data, "name"):
        return gen_fail_response(ReportInfo["005"])
    if is_key_str_empty(input_data, "singer"):
        return gen_fail_response(ReportInfo["032"])
    if is_str_empty(music_id) or not MusicDB.is_exist(music_id):
        return gen_fail_response(ReportInfo["036"])

    music_data = MusicDB.get_data(music_id)
    file_id = music_data["fileId"]
    file_data = FileSystemDB.get_data(file_id)
    file_data["name"] = "%s-%s" % (input_data["singer"], input_data["name"])
    FileSystemDB.edit_file(file_id, file_data)
    MusicDB.edit_data(music_id, input_data)
    return gen_success_response(ReportInfo["014"])


@MusicBoxBp.route(gen_prefix_api("/musics/<music_id>"), methods=["DELETE"])
@token_required
def delete_music(music_id: str):
    """删除音频"""
    if is_str_empty(music_id) or not MusicDB.is_exist(music_id):
        return gen_fail_response(ReportInfo["036"])
    music_data = MusicDB.get_data(music_id)
    file_id = music_data["fileId"]
    if FileSystemDB.is_file_exist(file_id):
        FileSystemDB.delete_file(file_id)
    MusicDB.delete_data(music_id)
    MusicSetDB.clear_by_music(music_id)
    return gen_success_response(ReportInfo["016"])


@MusicBoxBp.route(gen_prefix_api("/musicSets/<collect_id>"), methods=["DELETE"])
@token_required
def delete_collect(collect_id: str):
    """删除合集"""
    if is_str_empty(collect_id):
        return gen_fail_response(ReportInfo["034"])
    if not MusicSetDB.is_exist(collect_id):
        return gen_fail_response(ReportInfo["034"])
    MusicSetDB.delete_data(collect_id)
    return gen_success_response(ReportInfo["016"])


@MusicBoxBp.route(gen_prefix_api("/musicSets/<collect_id>/add"), methods=["POST"])
@token_required
def add_music_in_set(collect_id: str):
    """添加音频到合集"""
    if is_str_empty(collect_id):
        return gen_fail_response(ReportInfo["034"])
    if not MusicSetDB.is_exist(collect_id):
        return gen_fail_response(ReportInfo["034"])
    input_data = request.json
    if is_key_str_empty(input_data, "music_id"):
        return gen_fail_response(ReportInfo["037"])
    music_id = input_data["music_id"]
    if not MusicDB.is_exist(music_id):
        return gen_fail_response(ReportInfo["036"])
    MusicSetDB.add_music(collect_id, music_id)
    return gen_success_response(ReportInfo["022"])


@MusicBoxBp.route(gen_prefix_api("/musicSets/<collect_id>/remove"), methods=["POST"])
@token_required
def remove_music_out_set(collect_id: str):
    """添加音频到合集"""
    if is_str_empty(collect_id):
        return gen_fail_response(ReportInfo["034"])
    if not MusicSetDB.is_exist(collect_id):
        return gen_fail_response(ReportInfo["034"])
    input_data = request.json
    if is_key_str_empty(input_data, "music_id"):
        return gen_fail_response(ReportInfo["037"])
    music_id = input_data["music_id"]
    if not MusicDB.is_exist(music_id):
        return gen_fail_response(ReportInfo["036"])
    MusicSetDB.remove_music(collect_id, music_id)
    return gen_success_response(ReportInfo["022"])


@MusicBoxBp.route(gen_prefix_api("/musics"), methods=["GET"])
@token_required
@page_args_required
def search_music():
    """搜索音乐"""
    page = int(request.args.get("_page"))
    limit = int(request.args.get("_limit"))
    search_name = request.args.get("nameLike")
    if is_str_empty(search_name):
        return gen_fail_response(ReportInfo["021"])
    return jsonify(MusicDB.search_data(page, limit, search_name))

@MusicBoxBp.route(gen_prefix_api("/musicsTidyUp"), methods=["GET"])
@token_required
def tidy_up_musics():
    """整理音频数据"""
    all_music_data = MusicDB.db.all()
    for music_data in all_music_data:
        if not FileSystemDB.is_file_exist(music_data["fileId"]):
            MusicDB.delete_data(music_data["id"])
            MusicSetDB.clear_by_music(music_data["id"])
    return gen_success_response(ReportInfo["022"])