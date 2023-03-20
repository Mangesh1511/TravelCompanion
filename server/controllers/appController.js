const bcrypt = require('bcrypt')
const User = require('../models/users')
const jwt = require('jsonwebtoken')

const { cities } = require('../config/cities-name-list')
const {airports_data}=require('../config/airports')
const Station_codes=require('../config/Railway Stations.json')
const axios =require('axios')
const cookieParser = require('cookie-parser')
// const app=express();
// app.use(express.json());

const ValidCity = (cityName) => {


  for (const v of cities) {
    const a = v.toUpperCase()
    const b = cityName.toUpperCase()
    if (a === b) {
      console.log('The answer is: ', v.toUpperCase());
      return true;
    }

  }
  return false;

}


const register = async (req, res) => {

  try {
    console.log(req.method,req.url);
    console.log(req.body);
    try {
      const find = await User.findOne({ username: req.body.username });
      if (find == null) {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        //Create New User
        const user = new User({
          username: req.body.username,
          email: req.body.email,
          firstName:req.body.firstname,
          lastName:req.body.lastname,
          password: hashPassword
        });
        const person = await user.save();
        // const token = jwt.sign({ id: person._id, email: req.body.email }, process.env.SECRET_KEY, { expiresIn: '1d' })
        // res.status(200).cookie('token', token, { httpOnly: true }).json({ person, token: token });
        res.status(200).json({person:person});
      }
      else {
        res.status(403).json('already registered with us please login');
      }
    }
    catch (err) {
      console.log(err);
    }
    //Save New User and return response

  }
  catch (err) {
    console.log(err);
  }
}


 const login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user != null && user != undefined) {
      const Validpassword = await bcrypt.compare(req.body.password, user.password)
      if (!Validpassword) res.status(400).json('Wrong password  please try again !!')

      else {
        const token = jwt.sign({ id: user._id, email: req.body.email },process.env.SECRET_KEY, { expiresIn: '1d' })
        console.log(`asking for jwt token details :${req.cookies.jwtoken.secret}`);
        res.status(200).cookie("jwtoken", token, { httpOnly: true }).json({ user, token: token });
        // res.status(200).json(user);
      }
    }
    else
      res.status(404).json("User not found please register");


  } catch (err) {
    console.log(err);
  }
}

function get_airport_data(cityName)
{
  // console.log('showing airport data: ',airports_data)
  for(const v of airports_data)
  {
    if(v.city.toUpperCase()==cityName.toUpperCase())
    {
      return v;
    }
  }
  return null;
}

function get_station_codes(cityName)
{
  console.log(cityName)
  for (const v of Station_codes.data)
  {
    if(v.name.includes(cityName))
    {
      return v.code;
    }

  }
  return false;
  
}
const trainSchedules=async(req,res)=>{
  
  src_code=get_station_codes(req.params.srcCity.toUpperCase());
  dest_code=get_station_codes(req.params.destCity.toUpperCase());

  console.log('get Src and destination city: ',src_code,dest_code)

  const options = {
    method: 'GET',
    url: 'https://irctc1.p.rapidapi.com/api/v2/trainBetweenStations',
    params: {fromStationCode: src_code, toStationCode: dest_code},
    headers: {
      'X-RapidAPI-Key': '4f9b546a82mshf49946db3e4ef01p157620jsn166a1044e598',
      'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
    }
  };
  
  axios.request(options).then(function (response) {
    console.log(response.data);
    res.status(200).json(response.data);
  }).catch(function (error) {
    console.error(error);
    res.status(404).json(error);
  });
}

const nearbyAccessories=async(req,res)=>{
  console.log('In the request')
   try {
    console.log(req.params.cityName)
    const url = `http://dev.virtualearth.net/REST/V1/Routes/LocalInsights?Waypoint=${req.params.cityName}&TravelMode=Driving&Optimize=time&MaxTime=60&TimeUnit=Minute&type=SeeDo,Shop&key=AlTC9he2DiTAaibqX9oBK9WwGxo10wPsfla-myVg5jEmYyE_gPO9_Goo_S1WEUYL`


    const response = await fetch(url);

    if (response.status!=200 && !response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    // ✅ call response.json() here
    const result = await response.json();
      const arr={};
      console.log(result.resourceSets[0].resources[0].categoryTypeResults.length);
      for(var i=0;i<result.resourceSets[0].resources[0].categoryTypeResults.length;i++)
      {
        const category=result.resourceSets[0].resources[0].categoryTypeResults[i].categoryTypeName;
        console.log("Category: ",category)
        if(category=='See Do')
        result.resourceSets[0].resources[0].categoryTypeResults[i].categoryTypeName='SeeDo'
        console.log(result.resourceSets[0].resources[0].categoryTypeResults[i].entities);
        arr[`${result.resourceSets[0].resources[0].categoryTypeResults[i].categoryTypeName}`]=[];
        console.log( typeof( arr[`${result.resourceSets[0].resources[0].categoryTypeResults[i].categoryTypeName}`]))
        for(const v of result.resourceSets[0].resources[0].categoryTypeResults[i].entities)
        {
          arr[result.resourceSets[0].resources[0].categoryTypeResults[i].categoryTypeName].push(v.entityName);
        }
        // if(category.length>0)arr.push(category)
      }
     
      console.log('Arr is as follows');
      const keys=Object.keys(arr);
      console.log('The keys are as follows: ',keys);
      for(const v of keys)
      {
        console.log('Getting the properties from the value of the keys:')
        console.log(v)
        console.log(arr[v]);
        console.log('Going to get the next property')
      }

    res.status(200).json(arr);


    // res.status(200).json(result.resourceSets[0].resources[0].categoryTypeResults[0].entities);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

}

const nearbyHotels=async(req,res)=>{
  try {
    // console.log(url)
    const url = `http://dev.virtualearth.net/REST/V1/Routes/LocalInsights?Waypoint=${req.params.cityname}&TravelMode=Driving&Optimize=time&MaxTime=60&TimeUnit=Minute&type=HotelsAndMotels&key=AlTC9he2DiTAaibqX9oBK9WwGxo10wPsfla-myVg5jEmYyE_gPO9_Goo_S1WEUYL`
    const response = await fetch(url);

    if (response.status!=200 && !response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }

    // ✅ call response.json() here
    const result = await response.json();
    console.log(result.resourceSets[0].resources[0].categoryTypeResults.length);

      const arr=[];
      for(const v of result.resourceSets[0].resources[0].categoryTypeResults[0].entities)
      {
        arr.push(v.entityName)
      }

        

    res.status(200).json(arr);
    // res.status(200).json(result.resourceSets[0].resources[0].categoryTypeResults[0].entities);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
}

const transitPoints=async(req,res)=>{
    try {

    const getcity = ValidCity(req.params.city);

    if (!getcity) {
      // console.log('City not found error');
      res.status(404).json({ msg: 'City not found in the database!!' });
    }

    let src_lat = 18.5204, src_longitude = 73.8567, dest_lat = 18.7557, dest_longitude = 73.4091;
    axios.get(`https://api.geoapify.com/v1/geocode/search?city=${req.params.city}&apiKey=0d9568502cca49a29d3861244023e2f1`)
      .then((resp2) => {
        const arr = [];
        arr.push(resp2.data.features[0].lat);
        arr.push(resp2.data.features[0].lon);
        console.log('latitude is: ',resp2.data.features[0].properties.lat);
        src_lat = resp2.data.features[0].properties.lat;
        src_longitude = resp2.data.features[0].properties.lon;
        
        axios.get(`https://api.geoapify.com/v1/geocode/search?city=${req.params.dest_city}&apiKey=0d9568502cca49a29d3861244023e2f1`)
        .then((resp3)=>{
          dest_lat = resp3.data.features[0].properties.lat;
          dest_longitude = resp3.data.features[0].properties.lon;
          const url = `https://api.geoapify.com/v1/routing?waypoints=${src_lat}%2C${src_longitude}%7C${dest_lat}%2C${dest_longitude}&mode=drive&apiKey=0d9568502cca49a29d3861244023e2f1`
          const resp = fetch(url, {
  
            method: "GET",
            headers: {
              "Content-Type": "application/json",
   
            }
          })
            .then((resp) => resp.json())
            .then(async (data) => {
  
              const cities = new Set();
              const arr1 = [];
  
  
  
              let a = -1, b = -1, c = -1, d = -1;
  
              for (let v of data.features[0].geometry.coordinates[0]) {
  
                if (a == -1 && b == -1) {
  
                  a = v[0];
                  b = v[1];
  
                }
                else if (Math.abs(v[0] - a) + Math.abs(v[1] - b) >= 0.01) {
                  a = v[0], b = v[1];
  
                  arr1.push([v[0], v[1]])
  
                }
  
  
              }
              console.log(arr1.length)
  
              try {
                // console.log('next try\n')
                for (const v of arr1) {
                  // console.log(v[0],v[1])
                  const urlcity = `https://api.geoapify.com/v1/geocode/reverse?lat=${v[1]}&lon=${v[0]}&apiKey=0d9568502cca49a29d3861244023e2f1`
                  const resp = await fetch(urlcity, {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
  
                    }
                  })
                    .then((resp) => resp.json())
                    .then((data) => {
                      if (data.features[0].properties.city != null)
                        cities.add(data.features[0].properties.city)
  
  
                    })
                }
  
              }
              catch (err) {
                res.status(404).json(err);
              }
  
              for (const v of cities)
                console.log(v);
  
              res.status(200).json(Array.from(cities));
  
  
              // res.status(200).send(arr);
            })
            .catch((err) => {
              res.status(404).json(err);
            })
        })
        .catch((err) => {
          res.status(404).json(err);
        })

        })
        .catch((err)=>{
          console.log('Error in finding the second city');
          console.log(err);
          res.status(404).json(err);
        })
       



  }
  catch (err) {
    console.log(err);
    res.status(404).json(err);
  }
}

const getFlights=async(req,res)=>{
  
  const srcCityData=get_airport_data(req.params.src_city);
  const destCityData=get_airport_data(req.params.dest_city);
    if(srcCityData==null||destCityData==null||srcCityData==undefined||destCityData==undefined)
    {
      if(srcCityData==null||srcCityData==undefined)
      {
        res.status(404).json({msg:'AIRPORT NOT AVAILABLE AT SOURCE LOCATION'});

      }
      else if(destCityData==null||destCityData==undefined)
      {
        res.status(404).json({msg:'AIRPORT NOT AVAILABLE AT DESTINATION LOCATION'});
      }
    }
    
else
{
const options = {
  method: 'GET',
  url: 'https://flight-info-api.p.rapidapi.com/schedules',
  params: {version: 'v1', DepartureDate: req.params.date, DepartureAirport: srcCityData.code, ArrivalAirport: destCityData.code},
  headers: {
    'X-RapidAPI-Key': '4f9b546a82mshf49946db3e4ef01p157620jsn166a1044e598',
    'X-RapidAPI-Host': 'flight-info-api.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
	// console.log(response.data);
  const req_data=[];

    for(const v of response.data.data)
    {
      const arr={};
      arr['arr_carrier']=v.carrierCode.icao;
      arr['arr_apcode']=v.arrival.airport.iata;
      arr['arr_date']=v.arrival.date;
      arr['arr_time']=v.arrival.passengerLocalTime;
      arr['dep_apcode']=v.arrival.airport.iata;
      arr['dep_date']=v.arrival.date;
      arr['dep_time']=v.departure.passengerLocalTime;
      arr['int_stops']=v.segmentInfo.intermediateAirports.iata;
      req_data.push(arr);

    }
  res.status(200).json(req_data);
}).catch(function (error) {
	console.error(error);
  res.status(500).json(error);
});
}

}

const getDestCityData=async(req,res)=>{

      // const url=`https://en.wikipedia.org/w//api.php?action=query&format=json&list=allimages&aifrom=${req.params.destCity}&ailimit=10`
  const url=`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${req.params.destCity}`
  axios.request(url).then(function (response) {
    console.log(response.data.query.pages);
    const keys=Object.keys(response.data.query.pages);
    console.log('The keys are as follows: ',keys);
    res.status(200).json(response.data.query.pages[keys[0]].original);
  }).catch(function (error) {
    console.error(error);
    res.status(404).json(error);
  });

}

module.exports={register,login,trainSchedules,nearbyAccessories,nearbyHotels,transitPoints,getFlights,getDestCityData}