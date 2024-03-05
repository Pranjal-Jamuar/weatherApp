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
