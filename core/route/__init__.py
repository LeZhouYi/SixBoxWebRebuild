import flask

from core.route.home import HomeBp


def register_blueprints(app: flask.Flask):
    """注册所有蓝图"""
    app.register_blueprint(HomeBp)
