import flask
from flask_assets import Environment, Bundle

from core.route.file_system import FileSystemBp
from core.route.home import HomeBp
from core.route.user import UserBp


def register_blueprints(app: flask.Flask):
    """注册所有蓝图"""
    app.register_blueprint(HomeBp)
    app.register_blueprint(UserBp)
    app.register_blueprint(FileSystemBp)


def register_css_assets(assets: Environment):
    """注册所有css资源"""
    assets.register("login_css", Bundle(
        "css/message_style.css",
        "css/login_style.css",
        "css/styles.css",
        filters="cssmin",
        output="css/generate/login.css"
    ))
    assets.register("file_system_css", Bundle(
        "css/message_style.css",
        "css/confirm_popup_style.css",
        "css/side_bar_style.css",
        "css/page_select_style.css",
        "css/file_sys_style.css",
        "css/styles.css",
        filters="cssmin",
        output="css/generate/file_system.css"
    ))


def register_js_assets(assets: Environment):
    """注册所有js资源"""
    assets.register("login_js", Bundle(
        "js/sixbox/util/func.js",
        "js/sixbox/util/requestor.js",
        "js/sixbox/util/render.js",
        "js/sixbox/login.js",
        filters="jsmin",
        output="js/generate/login.js"
    ))
    assets.register("file_system_js", Bundle(
        "js/sixbox/util/func.js",
        "js/sixbox/util/requestor.js",
        "js/sixbox/util/render.js",
        "js/sixbox/common/sidebar.js",
        "js/sixbox/file_system.js",
        filters="jsmin",
        output="js/generate/file_system.js"
    ))
