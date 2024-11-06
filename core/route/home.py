import os.path

from flask import Blueprint, render_template

from core.common.file_utils import get_svg_content
from core.config.config import get_config_path

HomeBp = Blueprint("home", __name__)


@HomeBp.route("/home.html")
def home_page():
    static_path = get_config_path("file_static_path")
    data = {
        "title": "六号盒子",
        "js_file": "js/sixbox/home.js"
    }
    return render_template("home.html", **data)


@HomeBp.route("/")
def index():
    return home_page()
