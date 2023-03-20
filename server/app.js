require('./connection')
const fetch = require('cross-fetch')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken')
const cors = require("cors");
const destination = require('./models/destination')
const axios = require('axios')
const CookieParser = require('cookie-parser')

const app = express()
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

app.use(CookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config()


const authRoute=require('./routes/auth')
const feedbackRoute=require('./routes/feedback')
const getInfoRoute=require('./routes/infoRoutes')



//authentication middleware remaining


app.get('/', (req, res) => {
  const acc_token = req.cookies.jwtoken;
  const data = jwt.verify(acc_token, process.env.SECRET_KEY);
  const userId = data.id;

  console.log(data)
  res.send({ username: 'mangesh' });
})
app.post('/travels/feedback/addReview',async(req,res)=>{
console.log(req.body.Body)
const data=JSON.parse(req.body.Body)
console.log(data);
console.log('location is : ',data.location)
 const findcity = await destination.findOne({ cityName: data.location });
 try
 {
  
          // console.log(rev_data);
   
        const city = new destination({
            cityName: data.location,
            username:data.name,
            review:data.review,
            rating:data.rating
          });  
            const dest_city=await city.save()
          // const rev_data={};
         
          res.status(200).json(req.body)
      
         
    
    }
    catch(err)
    {
      console.log(err);
      res.status(404).json(err);
    }
})
app.get('/getreviews/:city',async(req,res)=>{
  
  const user=await destination.find({cityName:req.body.Body.city});
  res.status(200).json(user);
})
app.use('/travel/auth', authRoute);
app.use('/feedback',feedbackRoute);
app.use('/getinfo',getInfoRoute);

 app.get('/search/:cityname', async (req, res) => {

  try
  {
    console.log('In the request as follows: ',req.url);

  const cityName = req.params.cityname;
  console.log('The city is as follows:'.cityName);
  res.status(200).json({ cityName: cityName });
  }
  catch(err){
    console.log('Err for the request of search city is:\n',err)
    res.status(404).json(err);
  
  }

})


app.get('/getreviews/:city',async(req,res)=>{
  
  const user=await destination.find({cityName:req.body.city});
  res.status(200).json(user);
})
app.listen(5000, () => {
  console.log("App is listening at port 5000...");
});
