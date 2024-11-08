from flask import Blueprint, render_template

HomeBp = Blueprint("home", __name__)


@HomeBp.route("/home.html")
def home_page():
    data = {
        "js_file": "js/sixbox/home.js",
        "body_class": "background_body"
    }
    return render_template("home.html", **data)


@HomeBp.route("/")
def index_page():
    return home_page()
