from flask import Blueprint, request, jsonify

from core.common.route_utils import is_key_str_empty, gen_fail_response, get_client_ip

from core.route.route_data import ReportInfo, UsrServer, SessServer

UserBp = Blueprint('user', __name__)


@UserBp.route("/sessions", methods=["POST"])
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
        "user_id": user_id,
        "client_ip": client_ip
    })
    return jsonify(response)
