import requests

def strava_segment(id): 
	strava_access = '4207c2d027c24cc9a2b99d47f0d4531f3d8b627b'
	params = { 'access_token' : strava_access }
	url = 'https://www.strava.com/api/v3/segments/' + id

	r = requests.get(url, params = params)	
	return r.json()

def strava_leaderboard(id):
	strava_access = '4207c2d027c24cc9a2b99d47f0d4531f3d8b627b'
	params = { 'access_token' : strava_access }
	url = 'https://www.strava.com/api/v3/segments/' + id + '/leaderboard'

	r = requests.get(url, params = params )	
	return r.json()