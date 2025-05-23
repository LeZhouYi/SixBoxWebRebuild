from flask import Flask
from flask_assets import Environment

from core.common.file_utils import get_local_path
from core.config.config import get_config_by_section
from core.route import register_blueprints, register_assets


def run():
    """启动APP"""
    template_folder = get_local_path("sources/templates")
    static_folder = get_local_path("sources/static")
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
    register_blueprints(app)
    assets = Environment(app)
    register_assets(assets)
    app_port = get_config_by_section("flask", "app_port")
    app.run(debug=False, host="0.0.0.0", port=app_port)
