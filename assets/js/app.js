"use strict"

import { fetchData, url } from "./api.js"
import * as module from "./module.js"

/**
 * Add event listeners to multiple elements
 * @param {NodeList} elements - Element's node array
 * @param {string} eventType - Event Type .g, "click", "hover"
 * @param {Function} callback - callback function
 */
const addEventOnElements = function (elements, eventType, callback) {
  for (const elem of elements) elem.addEventListener(eventType, callback)
}

/**
 * Toggle search in mobile devices
 */
const searchView = document.querySelector("[data-search-view]")
const searchToggler = document.querySelectorAll("[data-search-toggler]")

const toggleSearch = () => searchView.classList.toggle("active")
addEventOnElements(searchToggler, "click", toggleSearch)

/**
 * API search Integration
 */
const searchField = document.querySelector("[data-search-field]")
const searchResult = document.querySelector("[data-search-result]")

let searchTimeout = null
let searchTimeoutDuration = 500

searchField.addEventListener("input", () => {
  searchTimeout ?? clearTimeout(searchTimeout)

  if (!searchField.value) {
    searchResult.classList.remove("active")
    searchResult.innerHTML = ""
    searchField.classList.remove("searching")
  } else {
    searchField.classList.add("searching")
  }

  if (searchField.value) {
    searchTimeout = setTimeout(() => {
      fetchData(url.geoCoding(searchField.value), function (locations) {
        searchField.classList.remove("searching")
        searchResult.classList.add("active")
        searchResult.innerHTML = `
          <ul class="view-list" data-search-list></ul>`
        const items = []
        for (const { name, lat, lon, country, state } of locations) {
          const searchItem = document.createElement("li")
          searchItem.classList.add("view-item")

          searchItem.innerHTML = `
            <span class="m-icon">location_on</span>
            <div>
              <p class="item-title">${name}</p>
              <p class="label-2 item-subtitle">${state || ""}, ${country}</p>
            </div>

            <a
              href="#/weather?lat=${lat}&lon=${lon}"
              class="item-link has-state"
              aria-label="${name} weather"
              data-search-toggler
            ></a>
          `
          searchResult
            .querySelector("[data-search-list]")
            .appendChild(searchItem)
          items.push(searchItem.querySelector("[data-search-toggler]"))
        }
        addEventOnElements(items, "click", function () {
          toggleSearch()
          searchResult.classList.remove("active")
        })
      })
    }, searchTimeoutDuration)
  }
})

const container = document.querySelector("[data-container]")
const loading = document.querySelector("[data-loading-screen]")
const currentLocationBtn = document.querySelector("[data-current-location-btn]")
const errorContent = document.querySelector("[data-error-content]")

/**
 *Dsiplay all the weather data in the HTML page.
 *
 * @param {number} lat - Latitude value
 * @param {number} lon - Longitude value
 */
export const updateWeather = (lat, lon) => {
  loading.style.display = "grid"
  container.style.overflowY = "hidden"
  container.classList.remove("fade-in")

  errorContent.style.display = "none"

  const currentWeatherSection = document.querySelector("[data-current-weather]")
  const hightlightSection = document.querySelector("[data-highlights]")
  const hourlyForecastSection = document.querySelector("[data-hourly-forecast]")
  const fiveDaysForecast = document.querySelector("[data-5-day-forecast]")

  currentWeatherSection.innerHTML = ""
  hightlightSection.innerHTML = ""
  hourlyForecastSection.innerHTML = ""
  fiveDaysForecast.innerHTML = ""

  if (window.location.hash === "#/current-location") {
    currentLocationBtn.setAttribute("disabled", "")
  } else {
    currentLocationBtn.removeAttribute("disabled")
  }

    /**
   * Current Weather
   */
  fetchData(url.currentWeather(lat, lon), currentWeather => {
    const {
      weather,
      dt: dateUnix,
      sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
      main: { temp, feels_like, pressure, humidity },
      visibility,
      timezone,
    } = currentWeather
    const [{ description, icon }] = weather

    const card = document.createElement("div")
    card.classList.add("card", "card-lg", "current-weather-card")
    card.innerHTML = `
  <h2 class="title-2 card-title">Now</h2>
  <div class="wrapper">
  <p class="heading">${parseInt(temp)}&deg;<sup>C</sup></p>
  <img
  src="./assets/images/weather_icons/${icon}.png"
  width="64"
  height="64"
  alt="${description}"
  class="weather-icon"
  />
  </div>
  <p class="body-3">${description}</p>
  <ul class="meta-list">
  <li class="meta-item">
  <span class="m-icon">calendar_today</span>
  <p class="title-3 meta-text">${module.getDate(dateUnix, timezone)}</p>
  </li>
  <li class="meta-item">
  <span class="m-icon">location_on</span>
  <p class="title-3 meta-text" data-location></p>
  </li>
  </ul>
  `

    fetchData(url.reverseGeo(lat, lon), ([{ name, country }]) => {
      card.querySelector("[data-location]").innerHTML = `${name}, ${country}`
    })

    currentWeatherSection.appendChild(card)
