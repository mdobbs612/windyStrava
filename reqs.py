import requests
from requests_toolbelt.adapters import appengine

appengine.monkeypatch()

def strava_segment(id): 
	strava_access = '4207c2d027c24cc9a2b99d47f0d4531f3d8b627b'
	params = { 'access_token' : strava_access }
	url = 'https://www.strava.com/api/v3/segments/' + id

	r = requests.get(url, params = params)	
	return r.json()

def strava_leaderboard(id, gender):
	strava_access = '4207c2d027c24cc9a2b99d47f0d4531f3d8b627b'
	params = { 'access_token' : strava_access }
	data = { 'gender' : gender }
	url = 'https://www.strava.com/api/v3/segments/' + id + '/leaderboard?gender=' + gender

	r = requests.get(url, params = params)
	return r.json()

def weather_data(lat, lon, date):
	url = "https://api.darksky.net/forecast/68eab12bea53c4a3bdf713f938122623/" + lat + "," + lon + "," + date + "?exclude=currently,flags"
	#url = "https://api.darksky.net/forecast/68eab12bea53c4a3bdf713f938122623/42.3601,-71.0589,409467600?exclude=currently,flags,daily"
	r = requests.get(url)
	return r.json()



# 	import urllib
# import urllib2
# import json
# #import requests
# #from requests_toolbelt.adapters import appengine

# #appengine.monkeypatch()

# def strava_segment(id): 
# 	strava_access = '4207c2d027c24cc9a2b99d47f0d4531f3d8b627b'
# 	params = { 'access_token' : strava_access }
# 	url = 'https://www.strava.com/api/v3/segments/' + id

# 	req = urllib2.Request(url + "?access_token=" + strava_access)
# 	response = urllib2.urlopen(req)


# 	#r = requests.get(url, params = params)	
# 	return json.loads(response.read())

# def strava_leaderboard(id, gender):
# 	strava_access = '4207c2d027c24cc9a2b99d47f0d4531f3d8b627b'
# 	params = { 'access_token' : strava_access, 'gender' : gender }
# 	url = 'https://www.strava.com/api/v3/segments/' + id + '/leaderboard'
# 	data = urllib.urlencode(params)

# 	req = urllib2.Request(url + "?" + data)
# 	response = urllib2.urlopen(req)
# 	#r = requests.get(url, params = params, data = data )
# 	return json.loads(response.read())

# def weather_data(lat, lon, date):
# 	url = "https://api.darksky.net/forecast/68eab12bea53c4a3bdf713f938122623/" + lat + "," + lon + "," + date + "?exclude=currently,flags"
# 	#url = "https://api.darksky.net/forecast/68eab12bea53c4a3bdf713f938122623/42.3601,-71.0589,409467600?exclude=currently,flags,daily"
	
# 	req = urllib2.Request(url)
# 	response = urllib2.urlopen(req)	
# 	return json.loads(response.read())