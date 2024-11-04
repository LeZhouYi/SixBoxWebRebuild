from flask import Blueprint, render_template

from core.route.route_data import HtmlText

HomeBp = Blueprint("home", __name__)


@HomeBp.route("/home.html")
def home_page():
    data = {
        "title": HtmlText["001"],
        "js_file": "js/sixbox/home.js"
    }
    return render_template("home.html", **data)


@HomeBp.route("/")
def index():
    return home_page()
