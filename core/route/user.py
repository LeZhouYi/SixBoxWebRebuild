import flask
from flask import Blueprint, request, jsonify, Response, render_template

from core.common.route_utils import is_key_str_empty, gen_fail_response, get_client_ip, gen_success_response, \
    get_bearer_token
from core.route.route_data import ReportInfo, UsrServer, SessServer, gen_prefix_api

UserBp = Blueprint("user", __name__)


@UserBp.route("/login.html")
def login_page():
    """登录页"""
    data = {
        "js_file": "js/sixbox/login.js",
        "body_class": "default_body",
        "login_api": gen_prefix_api("/sessions")
    }
    return render_template("login.html", **data)


@UserBp.route(gen_prefix_api("/sessions"), methods=["POST"])
def login():
    """登录"""
    data = request.json
    if is_key_str_empty(data, "account"):
        return gen_fail_response(ReportInfo["001"])
    if is_key_str_empty(data, "password"):
        return gen_fail_response(ReportInfo["002"])
    user_id = UsrServer.is_user_exist(data["account"], data["password"])
    if user_id is None:
        return gen_fail_response(ReportInfo["003"])

    # 生成Token
    client_ip = get_client_ip(request)
    response = SessServer.add_data({
        "userId": user_id,
        "clientIp": client_ip
    })
    return jsonify(response)


@UserBp.route(gen_prefix_api("/sessions"), methods=["DELETE"])
def logout():
    """登出"""
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result
    SessServer.delete(user_id=verify_result[0], client_ip=verify_result[1])
    return gen_success_response("登出成功")


def verify_token(request_in: flask.request) -> tuple[Response, int] | tuple[str, str]:
    """验证Token"""
    token = get_bearer_token(request_in)
    if token is None:
        return gen_fail_response(ReportInfo["010"], 401)
    client_ip = get_client_ip(request_in)
    result, data_or_info = SessServer.verify(token, client_ip)
    if result is False:
        if data_or_info == "TOKEN INVALID":
            return gen_fail_response(ReportInfo["010"], 401)
        elif data_or_info == "TOKEN EXPIRED":
            return gen_fail_response(ReportInfo["011"], 401)
    return data_or_info["userId"], client_ip
