import { coffeeOptions } from "../utils";
import { useState } from "react";
import Authentication from "./Authentication";
import Modal from "./Modal";
import { useAuthContext } from "../context/AuthContext";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function CoffeeForm(props) {
  const { isAuthenticated } = props;
  const [showModal, setShowModal] = useState(false);
  const [selectedCoffee, setSelectedCoffee] = useState(null);
  const [showCoffeeTypes, setShowCoffeeTypes] = useState(false);
  const [coffeeCost, setCoffeeCost] = useState(0);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);

  const { globalData, setGlobalData, globalUser } = useAuthContext();

  async function handleSubmitForm() {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    if (!selectedCoffee) {
      return;
    }

    try {
      // create new data obj
      const newGlobalData = {
        ...(globalData || {}),
      };

      const nowTime = Date.now();
      const timeToSubtract = hour * 60 * 60 * 1000 + minute * 60 * 1000;
      const timestamp = nowTime - timeToSubtract;

      const newData = {
        name: selectedCoffee,
        cost: coffeeCost,
      };
      newGlobalData[timestamp] = newData;
      console.log(timestamp, selectedCoffee, coffeeCost);

      // update global state
      setGlobalData(newGlobalData);

      // save the data in the firebase firestore
      const userRef = doc(db, "users", globalUser.uid);
      const res = await setDoc(
        userRef,
        {
          [timestamp]: newData,
        },
        { merge: true }
      );

      setSelectedCoffee(null);
      setHour(0);
      setMinute(0);
      setCoffeeCost(0);
    } catch (err) {
      console.log(err.message);
    }
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  return (
    <>
      {showModal && (
        <Modal handleCloseModal={handleCloseModal}>
          <Authentication handleCloseModal={handleCloseModal} />
        </Modal>
      )}
      <div className="section-header">
        <i className="fa-solid fa-pencil"></i>
        <h2>Start Tracking Today</h2>
      </div>
      <h4>Select coffee type</h4>
      <div className="coffee-grid">
        {coffeeOptions.slice(0, 5).map((option, optionIndex) => {
          return (
            <button
              onClick={() => {
                setSelectedCoffee(option.name);
                setShowCoffeeTypes(false);
              }}
              className={
                "button-card " +
                (option.name === selectedCoffee
                  ? " coffee-button-selected"
                  : " ")
              }
              key={optionIndex}
            >
              <h4>{option.name}</h4>
              <p>{option.caffeine} mg</p>
            </button>
          );
        })}
        <button
          onClick={() => {
            setShowCoffeeTypes(true);
            setSelectedCoffee(null);
          }}
          className={
            "button-card" + (showCoffeeTypes ? " coffee-button-selected" : " ")
          }
        >
          <h4>Other</h4>
          <p>n/a</p>
        </button>
      </div>
      {showCoffeeTypes && (
        <select
          onChange={(e) => {
            setSelectedCoffee(e.target.value);
          }}
          id="coffee-list"
          name="coffee-list"
        >
          <option value={null}>Select type</option>
          {coffeeOptions.map((option, optionIndex) => {
            return (
              <option key={optionIndex} value={option.name}>
                {option.name} ({option.caffeine}mg)
              </option>
            );
          })}
        </select>
      )}
      <h4>Add the cost ($)</h4>
      <input
        className="w-full"
        type="number"
        value={coffeeCost}
        onChange={(e) => setCoffeeCost(e.target.value)}
        placeholder="4.50"
      />
      <h4>Time since consumption</h4>
      <div className="time-entry">
        <div>
          <h6>Hours</h6>
          <select onChange={(e) => setHour(e.target.value)} id="hours-select">
            {[...Array(24).keys()].map((hour, hourIndex) => {
              return (
                <option key={hourIndex} value={hour}>
                  {hour}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <h6>Minutes</h6>
          <select
            onChange={(e) => setMinute(e.target.value)}
            id="minutes-select"
          >
            {[0, 5, 10, 15, 30, 45].map((minute, minuteIndex) => {
              return (
                <option key={minuteIndex} value={minute}>
                  {minute}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <button onClick={handleSubmitForm}>
        <p>Add Entry</p>
      </button>
    </>
  );
}
