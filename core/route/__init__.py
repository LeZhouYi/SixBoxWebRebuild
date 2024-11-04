import flask

from core.route.file_system import FileSystemBp
from core.route.home import HomeBp
from core.route.user import UserBp


def register_blueprints(app: flask.Flask):
    """注册所有蓝图"""
    app.register_blueprint(HomeBp)
    app.register_blueprint(UserBp)
    app.register_blueprint(FileSystemBp)
