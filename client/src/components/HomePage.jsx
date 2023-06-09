import React, {
  CSSProperties,
  useState,
  useEffect,
  useContext,
  createContext,
} from "react";
import Select, { AriaOnFocus } from "react-select";
import city from "../config/city";
import Card from "./Card";
import cities from "../config/cities-name-list";
import Travel from "./Travel";
import Stay from "./Stay";
import OtherPlaces from "./OtherPlaces";
import RoutePaths from "./RoutePaths";
import "../index.css";
import Weather from "./Weather";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import GiveFeedBackPage from "./GiveFeedBackPage";

//contexts
const travelContext = createContext();

const HomePage = () => {
  // states
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  //populating cityArray for React Select
  let cityArray = [];
  cities.map((item) => {
    cityArray.push({ label: item, value: item });
  });
  let cardsArrayData = [];
  for (let i = 0; i < city.length; i++) {
    cardsArrayData.push({
      name: city[i].famous_places[0].place_name,
      image: city[i].famous_places[0].picture,
      description: city[i].famous_places[0].description,
    });
    cardsArrayData.push({
      name: city[i].famous_places[1].place_name,
      image: city[i].famous_places[1].picture,
      description: city[i].famous_places[1].description,
    });
  }

  // Code related to react-select
  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  const style = {
    blockquote: {
      fontStyle: "italic",
      fontSize: ".75rem",
      margin: "1rem 0",
    },
    label: {
      fontSize: ".75rem",
      fontWeight: "bold",
      lineHeight: 2,
    },
  };

  // form onChange functions
  const handleDestinationChange = (selectedOption) => {
    setDestination(selectedOption.value);
  };
  const handleSourceChange = (selectedOption) => {
    setLocation(selectedOption.value);
  };
  function handleDateChange(event) {
    setDate(event.target.value);
  }

  //Handle search button click
  function handleSubmit(e) {
    console.log(date);
    if (location !== "" && date !== undefined && destination !== "") {
      setIsClicked(true);
      const url = `http://localhost:5000/search/` + location;
      axios
        .get(url)
        .then((res) => {
          console.log("location :", location);
          if (res.status === 200||res.status==304) {
            console.log("res status 200");
            navigate("/search?source=" + location + "&destination="+ destination + "&traveldate="+date);
          } else {
            navigate("/error")
          }
        })
        .catch((err) => {
          // navigate('/error')
          console.log(err.message);
        });
    } else setIsClicked(false);
  }
  //Handle tab clicks

  // todays date in isostring
  let today = new Date().toISOString().split("T")[0];
  //storing popular cards from json into an cardsArray
  let cardsArray = cardsArrayData.map((item) => {
    return (
      <Card
        name={item.name}
        image={item.image}
        description={item.description}
      />
    );
  });

  //styles
  const styles = {
    li: {
      backgroundColor: "cyan",
    },
  };

  console.log(location);

  return (
    <>
      <div>
        <div
          className="banner w-full px-4 py-10
       bg-teal-500 flex-col justify-start items-center"
        >
          <h1 className="text-center font-bold text-5xl">
            Where are you planning to go?
          </h1>
          <p className="text-center mt-6">Let's Go!</p>
        </div>
        <div className="selections flex item-center justify-around  w-[70%] ml-auto mr-auto p-4 shadow-xl shadow-gray-200 rounded-lg">
          <form className="md:w-[30%] sm:w-[100%] flex-col justify-center">
            <label
              style={style.label}
              id="aria-label"
              htmlFor="aria-example-input"
              className="w-full"
            >
              Select Source
            </label>

            <Select
              aria-labelledby="aria-label"
              inputId="aria-example-input"
              name="aria-live-color"
              onMenuOpen={onMenuOpen}
              onMenuClose={onMenuClose}
              options={cityArray}
              onChange={handleSourceChange}
              className="w-full"
            />

            <label
              style={style.label}
              id="aria-label"
              htmlFor="aria-example-input"
              className="w-full"
            >
              Select Destination
            </label>

            <Select
              aria-labelledby="aria-label"
              inputId="aria-example-input"
              name="aria-live-color"
              onMenuOpen={onMenuOpen}
              onMenuClose={onMenuClose}
              options={cityArray}
              onChange={handleDestinationChange}
              className="w-full"
            />
          </form>

          <div className="calendar-container md:w-[30%] sm:w-[100%] flex-col justify-center">
            <h4 className="mb-2" style={style.label}>
              Date
            </h4>
            <input
              type="date"
              className="w-full border"
              min={today}
              onChange={handleDateChange}
              value={date}
            />
          </div>
          {/* <Link to="/Search"> */}
          <button
            onClick={handleSubmit}
            className="bg-cyan-200 h-8 px-6 rounded-lg md:my-auto md:w-[25%] sm:w-[100%] sm:mt-4"
          >
            Search
          </button>
          {/* </Link> */}
        </div>

        {!isClicked ? (
          <div className="suggestion-container">
            <h2 className="text-center font-bold text-2xl my-10">
              Something special for you ...{" "}
            </h2>
            <div className="popular-places-cards grid lg:grid-cols-3 md:grid-cols-2 gap-4 w-4/5 p-4 ml-auto mr-auto">
              {cardsArray}
            </div>
          </div>
        ) : (
          <div>
            {/* <RoutePaths city={location}> </RoutePaths> */}
            {/* <Stay/> */}
            {/* <Travel/> */}
            {/* <Weather cityName="Lonavla"/> */}
          </div>
        )}
      </div>
      <GiveFeedBackPage />
    </>
  );
};
export { travelContext };
export default HomePage;
