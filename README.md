## About

	This is web intereface that uses a cors-proxy to fetch data from yahoo finacial api
	it started as a assigment that I created into a website

## How To deply
	To Deploy you must rebuilt from src.
	Make sure that you have installed npm dependencies
	`npm install`
	then type:
	`npm run build`
	you can test the it by running: 
	`npm start`
	Finnaly to deploy moving the files in the build folder to the html apache2 folder
	`sudo cp -rvf ./build/* /var/www/CompTicket`


