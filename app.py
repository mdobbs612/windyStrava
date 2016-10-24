from flask import Flask, render_template, jsonify
from reqs import strava_segment, strava_leaderboard, weather_data
import os

app = Flask(__name__)


@app.route("/segment/<id>")
def get_segment(id): 
	r = strava_segment(id)
	return jsonify(**r)

@app.route("/leaderboard/<id>/<gender>")
def get_leaderboard(id, gender):
	r = strava_leaderboard(id, gender)
	return jsonify(**r)

@app.route("/weather/<lat>/<lon>/<date>")
def get_weather(lat, lon, date):
	r = weather_data(lat, lon, date)
	return jsonify(**r)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='127.0.0.1', port=port)