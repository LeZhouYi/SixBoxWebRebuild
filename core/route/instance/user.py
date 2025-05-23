from flask import Blueprint, jsonify, render_template, request

from core.common.route_utils import is_key_str_empty, gen_success_response
from core.route.base.route_data import *
from core.route.base.route_decorate import token_required

UserBp = Blueprint("user", __name__)


@UserBp.route("/login.html")
def login_page():
    """登录页"""
    return render_template("login.html")


@UserBp.route(gen_prefix_api("/sessions"), methods=["POST"])
def login():
    """登录"""
    data = request.json
    if is_key_str_empty(data, "account"):
        return gen_fail_response(ReportInfo["001"])
    if is_key_str_empty(data, "password"):
        return gen_fail_response(ReportInfo["002"])
    user_id = UserDB.is_user_exist(data["account"], data["password"])
    if user_id is None:
        return gen_fail_response(ReportInfo["003"])

    # 生成Token
    client_ip = get_client_ip(request)
    response = SessionDB.add_data({
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
    SessionDB.delete(user_id=verify_result[0], client_ip=verify_result[1])
    return gen_success_response("登出成功")


@UserBp.route(gen_prefix_api("/refresh"), methods=["POST"])
def refresh():
    """刷新Token"""
    data = request.json
    if is_key_str_empty(data, "refreshToken"):
        return gen_fail_response(ReportInfo["010"])
    client_ip = get_client_ip(request)
    result, data_or_info = SessionDB.verify_refresh(data["refreshToken"], client_ip)
    if result is False:
        if data_or_info == "TOKEN INVALID":
            return gen_fail_response(ReportInfo["010"], 400)
    return jsonify(data_or_info)


@UserBp.route(gen_prefix_api("/usersTidyUp"), methods=["GET"])
@token_required
def tidy_up_data():
    UserDB.tidy_up_data()
    return gen_success_response(ReportInfo["022"])


@UserBp.route(gen_prefix_api("/userDetail"), methods=["GET"])
def get_user_detail():
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return verify_result
    data = UserDB.get_user(verify_result[0])
    if data is not None:
        return jsonify(data)
    return gen_fail_response(ReportInfo["028"])


@UserBp.route(gen_prefix_api("/users/<user_id>"), methods=["PUT"])
@token_required
def edit_user(user_id: str):
    user_data = UserDB.get_user(user_id)
    if user_data is None:
        return gen_fail_response(ReportInfo["028"])
    edit_data = request.json
    if is_key_str_empty(edit_data, "name"):
        return gen_fail_response(ReportInfo["029"])
    if "background" not in edit_data:
        return gen_fail_response(ReportInfo["030"])
    UserDB.edit_user(user_id, edit_data)
    return gen_success_response(ReportInfo["022"])
