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
