import flask
from flask_assets import Environment, Bundle

from core.common.file_utils import load_json_data
from core.config.config import get_config_path
from core.route.file_system import FileSystemBp
from core.route.home import HomeBp
from core.route.music_box import MusicBoxBp
from core.route.tinymce import TinyMceBp
from core.route.user import UserBp


def register_blueprints(app: flask.Flask):
    """注册所有蓝图"""
    app.register_blueprint(HomeBp)
    app.register_blueprint(UserBp)
    app.register_blueprint(FileSystemBp)
    app.register_blueprint(TinyMceBp)
    app.register_blueprint(MusicBoxBp)


def register_assets(assets: Environment):
    """通过json注册资源"""
    asset_configs = load_json_data(get_config_path("sources_config_path"))
    for filter_type, asset_dict in asset_configs.items():
        for asset_name, asset_attr in asset_dict.items():
            assets.register(
                asset_name,
                Bundle(
                    *asset_attr["sources"],
                    filters=filter_type,
                    output=asset_attr["output"]
                )
            )
