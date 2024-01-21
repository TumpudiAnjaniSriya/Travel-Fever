const axios = require('axios');
const ejs = require('ejs');
const express = require('express');
const bp = require('body-parser');
const ph = require("password-hash");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore,Filter} = require('firebase-admin/firestore');
var serviceAccount = require("./serviceAccountKey.json");

const app = express();

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const s = db.collection("signup1");

app.set('viewengine','ejs');
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.get('/',(req,res) => {
  res.render("landpage.ejs");
});

app.get('/currencyconverter',(req,res) => {
  res.render('convert.ejs',{val:'',fr:'',to:'',a:''});
});

app.post('/currencyconverter',(req,res) => {
  const fcurr = req.body.from;
  const tocurr = req.body.to;
  const amnt = req.body.amount;
    async function request(){

const options = {
  url: 'https://api.api-ninjas.com/v1/convertcurrency?want='+tocurr+'&have='+fcurr+'&amount='+amnt,
  headers: {
    'X-Api-Key': 'QTp+WPdMcObCb0duFPYsBg==tfWcDtcQ5LQsQiis'
  },
};

  let resp = await axios.request(options);
  res.render('convert.ejs',{val:resp.data.new_amount,fr:fcurr,to:tocurr,a:amnt})
  console.log(resp.data.new_amount);
}
request();
});

app.get('/akbartravels',(req,res) => {
  
  async function request(){
    let arr = [];
  const options = {
    method: 'GET',
    url: 'https://tours-api.p.rapidapi.com/tours',
    headers: {
    'X-RapidAPI-Key': 'e23ecd9bf1msh849a4cd2310e7b1p12a1dejsna67b8314f543',
    'X-RapidAPI-Host': 'tours-api.p.rapidapi.com'
    }
  };
	  const response = await axios.request(options);
    for(let i=0;i<50;i++){
      if (response.data[i].title!="Art and Craft Armenia 7 Nights / 8 Days"){
        arr.push(response.data[i]);
      }
    }
    res.render("trips.ejs",{array : arr});
}
request();
});

app.get('/location',(req,res)=>{
  res.render("location.ejs",{array:""});
});

app.post('/location',(req,res)=>{
  let loc_arr = [];
  const source = req.body.fromloc;
  const dest = req.body.toloc;
  console.log(req.body.fromloc);
  console.log(req.body.toloc);
  async function loc(){
    const options = {
      method: 'GET',
      url: 'https://driving-directions1.p.rapidapi.com/get-directions',
      params: {
        origin: source,
        destination: dest
      },
      headers: {
        'X-RapidAPI-Key': 'e23ecd9bf1msh849a4cd2310e7b1p12a1dejsna67b8314f543',
        'X-RapidAPI-Host': 'driving-directions1.p.rapidapi.com'
      }
    };
    try {
      const response = await axios.request(options);
      loc_arr.push(response.data.data.directions_link);
      console.log(loc_arr);
      res.render("location.ejs",{array:loc_arr});
    } catch (error) {
      console.error(error);
    }
  }
  loc();
});

app.get("/railway",(req,res)=>{
  res.render("railway.ejs",{trains:''});
});

app.post("/railway",(req,res)=>{
  let trains =[];
  const trainname = req.body.trainname;
  async function railway(){
      const options = {
          method: 'POST',
          url: 'https://trains.p.rapidapi.com/',
          headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': '67aef8ebc7mshb36ed64f9a8867dp1b65abjsnba361f5a4a8f',
            'X-RapidAPI-Host': 'trains.p.rapidapi.com'
          },
          data: {search:trainname}
        };
        
        try {
            const response = await axios.request(options);
            trains.push(response.data);
            res.render("railway.ejs",{trains:trains[0]});
                    
        } catch (error) {
            console.error(error);
        }
}
railway();
})


app.get("/hotels",(req,res)=>{
res.render("hotels.ejs",{hotels:""})
})

app.post("/hotels",(req,res)=>{
const location = req.body.location
async function locationid(){
  const options = {
    method: 'GET',
    url: 'https://hotels-com-provider.p.rapidapi.com/v2/regions',
    params: {
      query: location,
      domain: 'AE',
      locale: 'en_GB'
    },
    headers: {
      'X-RapidAPI-Key': '67aef8ebc7mshb36ed64f9a8867dp1b65abjsnba361f5a4a8f',
      'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
    }
  };
  
  try {
    const response = await axios.request(options);
    return response.data.data[0]["gaiaId"];
  } catch (error) {
    console.error(error);
  }
}
locationid()
  async function hotels(){
  const id = await locationid()
  const hotel_array =[]
  const checkindate = req.body.checkin 
  const checkoutdate = req.body.checkout
  const options = {
    method: 'GET',
    url: 'https://hotels-com-provider.p.rapidapi.com/v2/hotels/search',
    params: {
      region_id: id,
      locale: 'en_GB',
      checkin_date: checkindate,
      sort_order: 'REVIEW',
      adults_number: '1',
      domain: 'AE',
      checkout_date: checkoutdate
    },
    headers: {
      'X-RapidAPI-Key': '67aef8ebc7mshb36ed64f9a8867dp1b65abjsnba361f5a4a8f',
      'X-RapidAPI-Host': 'hotels-com-provider.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    hotel_array.push(response.data.properties)
    /*console.log(response.data.properties[0]["name"]);
    console.log(response.data.properties[0].availability["minRoomsLeft"])
    console.log(response.data.properties[0].propertyImage.image["url"])
    console.log(response.data.properties[0].destinationInfo.distanceFromMessaging)*/
    res.render("hotels.ejs",{hotels:hotel_array[0]})
  } catch (error) {
    console.error(error);
  }
  }
  hotels()
})

app.get('/nearbyplaces',(req,res) => {
  res.render("nearbyplaces.ejs",{array:""});
});

app.post('/nearbyplaces', async (req, res) => {
  const a = req.body.toloc;
  try {
    async function request() {
      const encodedParams = new URLSearchParams();
      encodedParams.set('q', a);
      encodedParams.set('language', 'en_US');

      const options = {
        method: 'POST',
        url: 'https://tourist-attraction.p.rapidapi.com/typeahead',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'X-RapidAPI-Key': '5cd0bfca0fmsh83b264ca43af18ep133555jsnd42e88b63c4b',
          'X-RapidAPI-Host': 'tourist-attraction.p.rapidapi.com'
        },
        data: encodedParams,
      };

      const response = await axios.request(options);
      console.log(response.data.results.data[0]);
      let lo_id = response.data.results.data[0].result_object.location_id;
      return lo_id;
    }

    async function places() {
      const reslt = await request();
      console.log(reslt);
      let arr_1 = [];
      const encodedParams = new URLSearchParams();
      encodedParams.set('location_id', reslt);
      encodedParams.set('language', 'en_US');
      encodedParams.set('currency', 'USD');
      encodedParams.set('offset', '0');

      const options = {
        method: 'POST',
        url: 'https://tourist-attraction.p.rapidapi.com/search',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'X-RapidAPI-Key': '5cd0bfca0fmsh83b264ca43af18ep133555jsnd42e88b63c4b',
          'X-RapidAPI-Host': 'tourist-attraction.p.rapidapi.com'
        },
        data: encodedParams,
      };

      const response = await axios.request(options);
      for (let i = 0; i < response.data.results.data.length; i++) {
        arr_1.push(response.data.results.data[i]);
      }
      console.log(arr_1);
      res.render("nearbyplaces.ejs", { array: arr_1 });
    }

    await places();
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("An error occurred while fetching nearby places.");
  }
});


app.get("/signup" , function(req,res){
  res.render('signup.ejs',{msg2:''});
});

app.post("/signupsubmit",function(req,res){
db.collection("signup1").where(
  Filter.or(
    Filter.where("username","==",req.body.username),
    Filter.where("password","==",req.body.pswd)
  ))
  .get()
  .then((docs)=>{
  if(docs.size>0){
  res.render("signup.ejs",{msg2:"Username already exists!!!"})}
else{
  db.collection("signup1").add({
    fname : req.body.fname,
    lname : req.body.lname,
    username : req.body.username,
    password : ph.generate(req.body.pswd)
  }).then(()=>{
    res.render('weather.ejs');
  })
}
})
})
app.get("/login",function(req,res){
  res.render("login.ejs",{msg:''})
});
app.post("/loginsubmit",function(req,res){

db.collection("signup1").where('username','==',req.body.Email )
  .get().then((docs)=>{
    let verified = false;
    docs.forEach((doc)=>{
      verified = ph.verify(req.body.pswd, doc.data().password);
    })
    if(verified){
      res.render('weather.ejs');
    }
    else{
      res.render('login.ejs',{msg:"Username is not found!!\nPlease signup"});
  }
 })
})



app.listen(3000,()=>{
  console.log("Server Started");
});