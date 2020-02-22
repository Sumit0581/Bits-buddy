
'use strict';
//Initialize libraries
const {
  dialogflow,
  SimpleResponse,
  BasicCard,
  List,
  Image,
  LinkOutSuggestion,
  Button,
  BrowseCarousel,
  BrowseCarouselItem,
} = require('actions-on-google');
const functions = require('firebase-functions');
var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://handouts-database.firebaseio.com/'
});
// Get a database reference to our posts
var db = admin.database();
const app = dialogflow({debug: true});
const ssml = '<speak>' + '<break time="1000ms" /> Is there anything else I can help you with ? ' + '</speak>';
// Attach an asynchronous callback to read the data at our posts reference

//const Datastore = require('@google-cloud/datastore');

// Instantiate a datastore client

app.middleware((conv) => {
    
  });
      
app.intent('Default Fallback Intent', (conv) => {
	console.log("Fallback intent triggered.");
   return conv.close("This isn't working.Have a good day. Bye! ");
});

app.intent('contactsIntent', (conv,{bhawan,contacts}) => {
	return new Promise( (( resolve,reject) => {
		console.log("contacts intent triggered .");
		console.log(`bhawan: ${bhawan} contacts: ${contacts}`);
		var ref = db.ref(`/bhawans/${bhawan}/${contacts}`);  
		ref.on("value", (snapshot) => {	 		
			var person = snapshot.val();
			if("name" in person){
				if (!conv.screen) {
	    				conv.ask(`<speak>.Here's the person ${person.name}. The contact number is <say-as interpret-as = "telephone">${person.contact}</say-as></speak>`);
					conv.ask(ssml);
					resolve();
	  			}
				else{
					if(bhawan === "Vyas Bhawan"){
						conv.ask("Locally.Come on buddy! Don't ask about the hostel under renovation.");
						conv.ask(ssml);
						resolve();					
					}
					else if(contacts === "Hostel Representative"){
						conv.ask(`Here's the ${contacts}`,new BasicCard({
							text: `Contact Number: ${person.contact}`,
							subtitle: `${contacts} of ${person.area}  \n Room: ${person.room}`,
							title: `${person.name}`,
							image: new Image({
								url: `${person.img}`,
								alt: 'Profile Image',
							  }),
						}));
						conv.ask(ssml);
						resolve();
					}
					else{
						conv.ask(`Here's the ${contacts}`,new BasicCard({
							text: `Contact Number: ${person.contact}`,
							subtitle: `${contacts} of ${person.area}`,
							title: `${person.name}`,
							image: new Image({
								url: `${person.img}`,
								alt: 'Profile Image',
							  }),
						}));
						conv.ask(ssml);
						resolve();
					}
				}
			}
			else{
			     if(contacts === "Hostel Representative"){	
				conv.ask(`Here are the persons`);
  				conv.ask(new BrowseCarousel({
    					items: [
      						new BrowseCarouselItem({
        						title: `${person["0"].name}`,
       							url: `${person["0"].img}`,
								description: `${contacts} of ${person["0"].area}  \n Contact Number:${person["0"].contact}  \n Room: ${person["0"].room}`,
								image: new Image({
									url: `${person["0"].img}`,
									alt: 'Profile Image',
								  }),
      						}),
      						new BrowseCarouselItem({
        						title: `${person["1"].name}`,
       							url: `${person["1"].img}`,
        						description: `${contacts} of ${person["1"].area}  \n Contact Number:${person["1"].contact}  \n Room: ${person["1"].room}`,
								image: new Image({
									url: `${person["1"].img}`,
									alt: 'Profile Image',
								  }),
      						}),
    						],
					  })
					  );
				conv.ask(ssml);
				resolve();
			} else{
				conv.ask(`Here are the persons`);
  				conv.ask(new BrowseCarousel({
    					items: [
      						new BrowseCarouselItem({
        						title: `${person["0"].name}`,
       							url: `${person["0"].img}`,
								description: `${contacts} of ${person["0"].area}  \n Contact Number:${person["0"].contact}`,
								image: new Image({
									url: `${person["0"].img}`,
									alt: 'Profile Image',
								  }),
      						}),
      						new BrowseCarouselItem({
        						title: `${person["1"].name}`,
       							url: `${person["1"].img}`,
        						description: `${contacts} of ${person["1"].area}  \n Contact Number:${person["1"].contact}`,
								image: new Image({
									url: `${person["1"].img}`,
									alt: 'Profile Image',
								  }),
      						}),
    						],
  					}));
				conv.ask(ssml);
				resolve();
			}

			}
		}, (errorObject) => {
				conv.close("No such information exists");
				reject(errorObject);
			
		});
	}));
});

app.intent('peopleInfoIntent', (conv,{importantPeople,departments}) => {
	return new Promise( (( resolve,reject) => {
			console.log("People info intent triggered.");
			console.log(`importantpeople: ${importantPeople} departments: ${departments}`);
			var ref = db.ref(`/departments/${departments}/${importantPeople}`);  
			ref.on("value", (snapshot) => {	 		
				var person = snapshot.val();
				if(person === undefined || person === null){
					conv.ask(`This is not valid query. There is no ${importantPeople} of ${departments}`);
					conv.ask(ssml);
					resolve();
				}
				if (!conv.screen) {
    					conv.ask(`<speak>Here's the person ${person.name}. The contact number is <say-as interpret-as = "telephone">${person.contact}</say-as></speak>`);
					conv.ask(ssml);
					resolve();
  				}
				else{
					conv.ask(`Here's the ${importantPeople}`,new BasicCard({
						text: `Contact Number: ${person.contact}`,
						subtitle: `${importantPeople} of ${departments}`,
						title: `${person.name}`,
						image: new Image({
							url: `${person.img}`,
							alt: 'Profile Image',
						  }),
						buttons: new Button({
						      title: 'Profile link',
      						      url: `${person.profile}`,
    						}),
					}));
					conv.ask(ssml);
					resolve();
				}
			}, (errorObject) => {
				conv.close("No such information exists");
				reject(errorObject);			
			});
	}));
});

app.intent('specificPeopleInfoIntent', (conv,{specificPeople}) => {
	return new Promise( (( resolve,reject) => {
		console.log("Specificpeople intent triggered.");
		console.log(`specificpeople: ${specificPeople}`);
		var ref = db.ref(`/specificPeople/${specificPeople}`);  
		ref.on("value", (snapshot) => {	 		
			var person = snapshot.val();
			 if (!conv.screen) {
    				conv.ask(`<speak>Here's the person ${person.name}. The contact number is <say-as interpret-as = "telephone">${person.phone}</say-as></speak>`);
				conv.ask(ssml);
				resolve();
  			}
			else{
				conv.ask(`Here's the person`,new BasicCard({
					text: `Contact Number: ${person.phone}`,
					subtitle: `${specificPeople}`,
					title: `${person.name}`,
				}));
				conv.ask(ssml);
				resolve();
			}
		}, (errorObject) => {
			conv.close("No such information exists");
			reject(errorObject);
		});
	}));
});

app.intent('MessIntent', (conv) => {
	return new Promise( ( resolve,reject)=>{
		var mess;
		let date_ob;
		var cur_date ;
		var hour;
		console.log("Mess intent triggered.");
		console.log(`Date recieved: ${conv.body.queryResult.parameters.date} Meal:${conv.body.queryResult.parameters.meal[0]}`);
		if((date_ob = conv.body.queryResult.parameters.date  )){
			cur_date = fixformat(date_ob);
			let ts = Date.now();
			date_ob = new Date(ts);
			date_ob.setHours(date_ob.getHours() + 5); 
			date_ob.setMinutes(date_ob.getMinutes() + 30);
			hour = date_ob.getHours();
		}else{
			let ts = Date.now();
			date_ob = new Date(ts);
			date_ob.setHours(date_ob.getHours() + 5); 
			date_ob.setMinutes(date_ob.getMinutes() + 30);
			let date = date_ob.getDate();
			let month = date_ob.getMonth() + 1;
			let year = date_ob.getFullYear();

			if (month<10)
			{month = "0"+month;}
			cur_date = date+"-"+month+"-"+year;
			hour = date_ob.getHours();
		}
		if (!(mess = conv.body.queryResult.parameters.meal[0])){
			if (hour>=10 && hour<14)
			mess = 'lunch';
	      	else if (hour>=14 && hour<21)
    	  	mess = 'dinner';
      		else mess = 'breakfast';
		}
		
		console.log("requesting data for date: "+cur_date+" meal: "+mess);
    	var ref = db.ref(`/mess/${cur_date}/${mess}`); 

   		 ref.on("value", (snapshot) => {
			var food;
			if(!(food = snapshot.val())){
				conv.ask("Data not available!");
				conv.ask(ssml);
				resolve();
			}

			if (!conv.screen) {
				conv.close(`this is the menu for ${mess}`);
				conv.ask(ssml);
				resolve();
			}
			else{
				var CardText="";
				var num = 1;
				for (const element of Object.keys(food)){
					CardText = CardText +num+". "+food[element]+"  \n";
					num=num+1;
				}
        		CardText = CardText + "That's all folks!";
        		conv.ask(`Here's the menu`,new BasicCard({
					text: CardText,
					subtitle:`on ${cur_date}`,
					title: `Menu for ${mess}`
				}));
			conv.ask(ssml);
			resolve();
			}
		}, (errorObject) =>{
			conv.close("No such information exists");
			reject(errorObject);
		});
	});
});

var department = ""; // required for acccessing department name in optionselected intent

app.intent('handoutIntent', (conv,{departments}) => {
	return new Promise( ( resolve,reject) => {
		department = `${departments}`;
		console.log("Handout intent triggered.");
		// console.log(`Department: ${departments}`);
		var ref = db.ref(`/departments/${departments}/Handouts`);  
		ref.on("value", (snapshot) => {	 		
			var dept = snapshot.val();
			var keys = Object.keys(dept); //object with name of all the courses in the department
			// console.log(dept);
			var courses = {};
			
			for( var i =  0; i<keys.length ;i++)
			{	
				var tempcourse = snapshot.child(keys[i]).val();
				// console.log(tempcourse);
				
				courses[keys[i]]={
					title: keys[i],
					description: tempcourse.course_name
				}
			}
			if(department === "Humanities Department" ){
				courses["HSS"]={
					title: "Other Humanitites Courses",
					description: "Select this option for more Humanities Courses"
				}
			}
			// console.log(JSON.stringify(courses,null,3));
			
			if (!conv.screen) {
				conv.ask('Sorry, try this on a screen device or select the ' +
				  'phone surface in the simulator.');
				conv.ask(ssml);
				return;
			}
			else{
				const speak = `The courses in ${departments} are given below. You can choose any one of these to get the handout.`;
				conv.ask(speak);
				conv.ask(new List({
					items: courses
				}));
				// conv.ask(ssml);
				resolve();
			}
		}, (errorObject) => {
			conv.close("No such information exists");
			reject(errorObject);
		});
	});
});

app.intent('optionselectedIntent',(conv,input,option) =>{
	return new Promise( ( resolve,reject) =>{
		if(option === "HSS"){
			department= "Humanities Department 2";
			console.log(department);
			var ref1 = db.ref(`/departments/` + department + `/Handouts`); 

			ref1.on("value", (snapshot) =>{
				var dept = snapshot.val();
				var keys = Object.keys(dept);
				console.log(dept);
				var courses = {};
				
				for( var i =  0; i<keys.length ;i++)
				{	
					var tempcourse = snapshot.child(keys[i]).val();
					// console.log(tempcourse);
					
					courses[keys[i]]={
						title: keys[i],
						description: tempcourse.course_name
					}
				}

				const speak = `More courses in humanities department are given below. You can choose any one of these to get the handout.`;
				conv.ask(speak);
				conv.ask(new List({
					items: courses
				}));
				resolve();
			}, (errorObject) => {
				conv.close("No such information exists");
				reject(errorObject);
			});
		}
		else{
			console.log('Option selected intent trigerred for :'+ department);
			var ref2 = db.ref(`/departments/` + department + `/Handouts`);  
			ref2.on("value", (snapshot) => {
					// console.log(snapshot.val());
					console.log(option);
					var tempcourse = snapshot.child(option).val();
					console.log(tempcourse);

					if (!conv.screen) {
						conv.ask('Sorry, try this on a screen device or select the phone surface in the simulator.');
						conv.ask(ssml);
						return;
					}
					else{				
							var url = 'https://academic.bits-pilani.ac.in/Faculty/FINAL_HANDOUT_FILES/' + tempcourse.course_code + '_' + tempcourse.comp_code + '.pdf';
							conv.ask('Your link to handout is given below.');
							conv.ask(new LinkOutSuggestion({
							name: 'Your link to handout',
							url: url,
						}));
						conv.ask(ssml);
						resolve();
					}
				},(errorObject) => {
					conv.close("No such information exists");
					reject(errorObject);
				}
			);
		}
	});
});

function fixformat(date){
	if(date[8] === '0'){
		date = date[9]+"-"+date[5]+date[6]+"-"+date[0]+date[1]+date[2]+date[3];
	}
	else{
		date = date[8]+date[9]+"-"+date[5]+date[6]+"-"+date[0]+date[1]+date[2]+date[3];
	}
	return date;
}

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);