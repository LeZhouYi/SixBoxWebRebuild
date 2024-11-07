import os.path

from flask import Blueprint, render_template, request, Response, redirect, url_for

from core.route.user import verify_token

HomeBp = Blueprint("home", __name__)


@HomeBp.route("/home.html")
def home_page():
    verify_result = verify_token(request)
    if isinstance(verify_result[0], Response):
        return redirect(url_for("user.login_page"))
    else:
        data = {
            "js_file": "js/sixbox/home.js",
            "body_class": "background_body"
        }
        return render_template("home.html", **data)


@HomeBp.route("/")
def index_page():
    return home_page()
