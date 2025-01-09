from flask import Blueprint, render_template, request, Response

from core.common.route_utils import gen_fail_response
from core.route.route_data import gen_prefix_api, verify_token, ReportInfo

MusicBoxBp = Blueprint("music_box", __name__)


@MusicBoxBp.route("/music.html")
def music_page():
    return render_template("music.html")


@MusicBoxBp.route(gen_prefix_api("/musics"), method=["POST"])
def add_music():
    """新增音频"""
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result
        # 获取并检查数据
    file = request.files.get("file")
    if not file:
        return gen_fail_response(ReportInfo["007"])
