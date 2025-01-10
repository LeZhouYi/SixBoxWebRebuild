from functools import wraps

from flask import request, Response

from core.common.route_utils import is_str_empty, gen_fail_response
from core.route.base.route_data import verify_token, ReportInfo


def token_required(func):
    """添加Token校验"""

    @wraps(func)
    def decorated(*args, **kwargs):
        verify_result = verify_token(request)
        if isinstance(verify_result[0], Response):
            return verify_result
        return func(*args, **kwargs)

    return decorated


def page_args_required(func):
    """添加页数校验"""

    @wraps(func)
    def decorated(*args, **kwargs):
        page = request.args.get("_page")
        if is_str_empty(page):
            return gen_fail_response(ReportInfo["017"])
        limit = request.args.get("_limit")
        if is_str_empty(limit):
            return gen_fail_response(ReportInfo["018"])
        if int(page) < 0:
            return gen_fail_response(ReportInfo["019"])
        if int(limit) < 1:
            return gen_fail_response(ReportInfo["020"])
        return func(*args, **kwargs)

    return decorated
