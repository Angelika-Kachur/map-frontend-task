"use strict";

//Variables
const doc = document;
let elemPlaces = doc.querySelector('#places__list');
let btnAddPlace = doc.querySelector('.btn--add-place');
let map;

/* MAP */

//Init Map
function initMap() {
    var helsinkiLocation = { lat: 60.16901644495906, lng: 24.93797779083252 };
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: helsinkiLocation
    });
}
const markers = new Map();
//Create Markers
function createMarker(place) {
    if(place.isDeleted) return;

    let id = parseInt(place.id);
    let title = place.title;
    let lat = parseFloat(place.location[0]);
    let lng = parseFloat(place.location[1]);
    let location = {lat: lat, lng: lng};
   
    if(!markers.get(id)){
        let marker = new google.maps.Marker({
            title: title,
            position: location
        });
        marker.setMap(map);

        markers.set(parseInt(place.id),marker)
        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        })

        let infoWindow= new google.maps.InfoWindow({
            content: `<h1>${title}</h1>`
        })

        if(place.isDeleted) {
            marker.setMap(null);
        }
    }

}

function getLatLng() {
    google.maps.event.addListener(map, 'click', function(event) {
        let location = {lat: event.latLng.lat(), lng: event.latLng.lng()}
        createAddingForm(location);
        showPopup();
    })
}

//CreateMap
function createMap() {
    initMap();
    getPlaces();
    getLatLng();
}

//Render All Places on Map
function renderPlacesOnMap(places) {
    for (let place of places) {
        createMarker(place);
    }
}

/* PLACES */

//Render All Places
function renderPlaces(places) {
    elemPlaces.innerHTML = '';
    for (let place of places) {
        let li = doc.createElement('li');
        li.setAttribute('data-placeid', place.id);
        li.setAttribute('data-isdeleted', place.isDeleted);
        li.classList.add('place');
        li.innerHTML = `<div class="place__box">
                            <div class="place__name">${place.title}</div>
                            <div class="place__description">${place.description}</div>
                            <div class="place__openHours">${place.openHours[0]}:00 - ${place.openHours[1]}:00</div>
                            <div class="place__keywords">${place.keyWords}</div> 
                            <div class="place__btns">
                                <button class="btn btn--delete-place"><i class="icon icon-trash-2"></i> <span class="btn-text">Delete place</span></button>
                                <button class="btn btn--edit-place"><i class="icon icon-pen-angled"></i> <span class="btn-text">Edit place</span></button>
                            </div>
                        </div>
                        `;
        elemPlaces.appendChild(li);
    };
}

//Create Adding Form
function createAddingForm(location) {
    let place = {}
    place.title = "Place Title"
    place.description = "Place Description"
    if(location) {
        place.location = [
            location.lat, location.lng
        ]
    } else {
        place.location = [
            'Latitude',
            'Longitude'
        ]
    }
    place.openHours =  [
        'Open Hours - start',
        'Open Hours - end'
    ]
    place.keyWords = "Your keywords here"
    let elemForm = doc.querySelector('#places__form-holder');
    elemForm.innerHTML = '';
    let form = doc.createElement('form');
    form.setAttribute('data-placeId', -1);
    form.setAttribute('name', 'addingForm');
    form.setAttribute('action', 'POST');
    form.classList.add('places__form');
    form.innerHTML = `<h2 class="form__title">Add new Place</h2>
                    <input name="title" type="text" value="${place.title}" class="input place__title">
                    <textarea name="description" type="text" class="textarea place__description">${place.description}</textarea>
                    <div class="inputs-holder">
                        <input name="hoursStart" type="text" value="10" class="input place__hoursStart">
                        <input name="hoursEnd" type="text" value="22" class="input place__hoursEnd">
                    </div>
                    <div class="inputs-holder">
                        <input name="lat" type="text" value="${place.location[0]}" class="input place__lat">
                        <input name="lng" type="text" value="${place.location[1]}" class="input place__lng">
                    </div>
                    <button type="button" class="btn btn--save btn--save-added-place">Add place</button>`;
    elemForm.appendChild(form);
}

//Create Editing Form
function createEditingForm(place) {
    let elemForm = doc.querySelector('#places__form-holder');
    elemForm.innerHTML = '';
    let form = doc.createElement('form');
    form.setAttribute('data-placeId', place.id);
    form.setAttribute('name', 'editingForm');
    form.setAttribute('action', 'POST');
    form.classList.add('places__form');
    form.innerHTML = `<h2 class="form__title">Edit Place</h2>
                    <input name="title" type="text" value="${place.title}" class="input place__title">
                    <textarea name="description" type="text" class="textarea place__description">${place.description}</textarea>
                    <div class="inputs-holder">
                        <input name="hoursStart" type="text" value="${place.openHours[0]}" class="input place__hoursStart">
                        <input name="hoursEnd" type="text" value="${place.openHours[1]} " class="input place__hoursEnd">
                    </div>
                    <div class="inputs-holder">
                        <input name="lat" type="text" value="${place.location[0]}" class="input place__lat">
                        <input name="lng" type="text" value="${place.location[1]}" class="input place__lng">
                    </div>
                    <button type="button" class="btn btn--save btn--save-edited-place">Save place</button>`;
    elemForm.appendChild(form);
}

//Add New Place
function createNewPlace() {
    event.preventDefault();
    postPlace();
}

//Edit Specific Place
function saveEditedPlace(places, placeId) {
    event.preventDefault();
    renderPlaces(places.places);
    renderPlacesOnMap(places.places);
}

/* SERVER REQUESTS */

//GET all Places to render on the page
function getPlaces() {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
        let responseObj = xhr.response;
        renderPlaces(responseObj.places);
        renderPlacesOnMap(responseObj.places);
    };
    xhr.open('GET', '/places');
    xhr.responseType = 'json';
    xhr.send();
   
}

//POST New Place to Places
function postPlace() {
    let xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onload = function() {
        let responseObj = xhr.response;
        renderPlaces(responseObj.places);
        renderPlacesOnMap(responseObj.places);
    };
    let formData = new FormData(document.forms.addingForm);
    let object = {};
    formData.forEach((value, key) => {object[key] = value});
    let json = JSON.stringify(object);
    xhr.open('POST', '/place');
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.send(json);
}

//GET Specific Place to edit it
function getSpecificPlace(placeId) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
        let place = xhr.response;
        createEditingForm(place)
    };
    xhr.open('GET', `/place/${placeId}`);
    xhr.responseType = 'json';
    xhr.send();
   
}

//PUT Specific Place to save it after editing
function putSpecificPlace(placeId) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
        let responseObj = xhr.response;
        saveEditedPlace(responseObj, placeId)
        renderPlaces(responseObj.places);
        renderPlacesOnMap(responseObj.places);
    };
    let formData = new FormData(document.forms.editingForm);
    formData.append('placeId', placeId);
    let object = {};
    formData.forEach((value, key) => {object[key] = value});
    let json = JSON.stringify(object);

    let lat = parseFloat(object.lat);
    let lng = parseFloat(object.lng);
    let location = {lat: lat, lng: lng}
    
    let marker = markers.get(parseInt(placeId));
    marker.setPosition(location);

    xhr.open('PUT', `/place/${placeId}`);
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhr.responseType = 'json';
    xhr.send(json);
}

//DELETE Specific Place
function deleteSpecificPlace(placeId) {
    let xhr = new XMLHttpRequest();
    markers.get(parseInt(placeId)).setMap(null);
    xhr.onload = function() {
        renderPlaces(xhr.response.places);
    }
    xhr.open('DELETE', '/place/'+placeId);
    xhr.responseType = 'json';
    xhr.send();
}

/* EVENT LISTENERS */

//Create 'Adding Form' on Btn Click
if(btnAddPlace){
    btnAddPlace.addEventListener('click', function() {
        createAddingForm()
        showPopup()
    });
}

//Create New Place and Send it to the Server
doc.addEventListener('click', function() {
    if (event.target.classList.contains('btn--save-added-place')) {
        createNewPlace();
        hidePopup();
    }
});

//Create 'Editing Form' on Btn Click
if(elemPlaces){
    elemPlaces.addEventListener('click', function() {
        if (event.target.classList.contains('btn--edit-place')) {
            let specificPlace = event.target.closest('.place');
            let placeId = specificPlace.getAttribute('data-placeid');
            getSpecificPlace(placeId);
            showPopup();
        }
    });
}

//Save Edited Place and Send it to the Server
doc.addEventListener('click', function() {
    if (event.target.classList.contains('btn--save-edited-place')) {
        let specificPlace = event.target.closest('.places__form');
        let placeId = specificPlace.getAttribute('data-placeid');
        putSpecificPlace(placeId);
        hidePopup();
    }
});

//Delete Specific Place
doc.addEventListener('click', function() {
    if (event.target.classList.contains('btn--delete-place')) {
        let specificPlace = event.target.closest('.place');
        let placeId = specificPlace.getAttribute('data-placeid');
        deleteSpecificPlace(placeId);
    }
});

/* POPUP */

//Show Popup
function showPopup() {
    let elemPopup = doc.querySelector('.popup');
    elemPopup.classList.add('popup--open');
}

//Hide Popup
function hidePopup() {
    let elemPopup = doc.querySelector('.popup');
    elemPopup.classList.remove('popup--open');
}

doc.addEventListener('mousedown', function() {
    if (event.target.classList.contains('close-popup')) {
        hidePopup();
    } else if (event.target.classList.contains('popup')) {
        hidePopup();
    }
});