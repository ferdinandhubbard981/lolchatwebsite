import requests
import sys
import json
import random
import string

def get_random_alphaNumeric_string(stringLength):
    lettersAndDigits = string.ascii_letters + string.digits
    return ''.join((random.choice(lettersAndDigits) for i in range(stringLength)))

def ServerExist(baseUrl, gameTeamId):
	
	URL = baseUrl + "servers/"
	
	response = requests.get(URL).json()
	
		
	for server in response:
		if(server["name"] == gameTeamId and server["running"]):
			URL = baseUrl + "servers/" + str(server["id"]) + "/conf"
			response = requests.get(URL).json()
			
			return ["/s" + str(server["port"] - 64738), response["password"]]
	return [""]


def StartServer(baseUrl, gameTeamId):
	URL = baseUrl + "servers/"
	response = requests.get(URL).json()
	for server in response:
		if (server["running"] == False):
			URL = baseUrl + "servers/" + str(server["id"]) + "/start"
			response = requests.post(URL)
			if ("500" in str(response)):
			    return ["Error: internal error iceapi"]
			response = response.json()

			if (response["message"] !=  "Server started."):
				return ["Error: internal error"]
			URL = baseUrl + "servers/" + str(server["id"]) + "/conf"
			keyval = {"key": "registername", "value": gameTeamId}
			response = requests.post(URL, data = keyval).json()
			if ("updated" in response["message"] == False):
				return ["Error: internal error"]
			password =  get_random_alphaNumeric_string(random.randint(10, 15))
			keyval = {"key": "password", "value": password}
			response = requests.post(URL, data = keyval).json()
			if ("updated" in response["message"] == False):
				return ["Error: internal error"]
			return ["/s" + str(server["port"] - 64738), password]
				
			
	return ["Error: No servers available, please try again later"]

if __name__ == "__main__":
	baseUrl = "http://94.237.97.168:80/"
	gameTeamId = str(sys.argv[1:][0])
	#gameTeamId = "epicgamertest"
	message = ServerExist(baseUrl, gameTeamId)
	if (message[0] == ""):
		message = StartServer(baseUrl, gameTeamId)

		for msg in message:
	    		print(msg)
	    		
	else:
	    for msg in message:
	    	print(msg)
		
