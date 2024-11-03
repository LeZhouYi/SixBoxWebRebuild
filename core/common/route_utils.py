import time
from random import Random

import flask
from flask import Response, jsonify

Rand = Random()


def gen_id() -> str:
    """生成ID"""
    return "%s%s" % (int(time.time()), str(Rand.randint(100, 999)))


def gen_fail_response(text: str) -> tuple[Response, int]:
    """生成400 response"""
    return jsonify({"status": "Fail", "message": text}), 400


def gen_success_response(text: str) -> Response:
    """生成操作成功的信息"""
    return jsonify({"status": "OK", "message": text})


def is_str_empty(value: str) -> bool:
    """
    判断字符串是否为空
    :param value:
    :return: true表示为空
    """
    return value is None or str(value).strip() == ""


def is_key_str_empty(data: dict, key: str) -> bool:
    """
    判断字典是否存在某数据且非空
    :param data:
    :param key:
    :return: true 表示 不存在或空
    """
    return key not in data or str(data[key]).strip() == ""


def get_client_ip(request: flask.request) -> str:
    """获取用户端IP"""
    forwarded_for = request.headers.get('X-Forwarded-For')
    if forwarded_for:
        client_ip = forwarded_for.split(',').strip()
    else:
        client_ip = request.remote_addr
    return client_ip
