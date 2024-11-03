from flask import Flask

from core.config.config import get_config
from core.route import register_blueprints
from core.common.file_utils import get_local_path


def run():
    """启动APP"""
    template_folder = get_local_path("sources/templates")
    static_folder = get_local_path("sources/static")
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
    register_blueprints(app)
    app_port = int(get_config("app_port"))
    app.run(debug=False, host="0.0.0.0", port=app_port)
