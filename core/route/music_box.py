from flask import Blueprint, render_template

MusicBoxBp = Blueprint("music_box", __name__)


@MusicBoxBp.route("/music.html")
def home_page():
    return render_template("music.html")
