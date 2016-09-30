from flask import Flask, render_template, jsonify
import os
import requests


strava_access = '4207c2d027c24cc9a2b99d47f0d4531f3d8b627b'
params = { 'access_token' : strava_access }
url = 'https://www.strava.com/api/v3/segments/2294005/leaderboard'

r = requests.get(url, params = params)	

print r.json()