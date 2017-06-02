/**
 * Google Map Functions
 */

var GoogleMaps = {
    // Initialize Google Maps
    init: function() {
        infowindow = new google.maps.InfoWindow();

        google.maps.event.addDomListener(infowindow, 'domready', function() {
            $('#details-link').click(function(){
                if (data.listShown == false) {
                    ViewModel.listToggleClick();
                }
                ViewModel.getDetails();
            });
        });

        bounds = new google.maps.LatLngBounds();

        map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 26.560909, lng: -81.914532},
        zoom: 13,
        maxZoom: 16
        });
    },

    // Animate the selected marker
    selectMarker: function(newMarker, currentMarker) {
        if (currentMarker && newMarker != currentMarker) {
            currentMarker.setAnimation();
        }
        data.selected = newMarker;
        newMarker.setAnimation(google.maps.Animation.BOUNCE);
        map.panTo(newMarker.position);
        GoogleMaps.makeInfowindow(newMarker);
    },

    // Initialize infowindow and show it
    makeInfowindow: function(marker) {
        infowindow.marker = marker;
        infowindow.setContent('');
        // Make sure the marker property is cleared out
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
            marker.setAnimation();
            if (data.listShown == true) {
                ViewModel.listToggleClick();
            }
        });

        infowindow.setContent('<div>' + marker.name + '</br></br><span id="details-link">Click for Details</span></div>');

        infowindow.open(map, marker);
    }
}


/**
 * Model
 */

var data = {
    selected: null,
    listShown: false,
    restaurant: null,
    reviews: null,
    restaurants: [
    {id: 0, name: "Citrola's on College", location: {lat: 26.556048, lng: -81.901234}},
    {id: 1, name: "Cibo", location: {lat: 26.553572, lng: -81.909727}},
    {id: 2, name: "Wok Cuisine-Chinese Restaurant", location: {lat: 26.581758, lng: -81.873441}},
    {id: 3, name: "Cape Cod Fish Co", location: {lat: 26.516508, lng: -81.944959}},
    {id: 4, name: "Thai Gardens", location: {lat: 26.555538, lng: -81.872587}}
    ]
};

/**
 * ViewModel
 */

var ViewModel = {

    restaurantList: ko.observableArray([]),
    restaurantName: ko.observable(),
    restaurantPrice: ko.observable(),
    restaurantRating: ko.observable(),
    restaurantCuisine: ko.observable(),
    restaurantAddressOne: ko.observable(),
    restaurantAddressTwo: ko.observable(),
    restaurantCity: ko.observable(),
    restaurantState: ko.observable(),
    restaurantZip: ko.observable(),
    restaurantReviews: ko.observableArray([]),

    markers: [],

    init: function() {
        data.restaurants.forEach(function(restaurantData) {
            ViewModel.restaurantList.push(new ViewModel.listItem(restaurantData));
        });
    },
   
    listItem: function(restaurantDetails) {
        this.id = ko.observable(restaurantDetails.id);
        this.name = ko.observable(restaurantDetails.name);
        this.location = ko.observable(restaurantDetails.location);
    },

    reviewItem: function(reviewDetails) {
        this.text = ko.observable(reviewDetails.text);
        this.rating = ko.observable(reviewDetails.rating);
        this.date = ko.observable(reviewDetails.time_created);
    },

    filterList: function() {
        var filterText = document.getElementById('filter').value.toLowerCase();
        ViewModel.restaurantList([]);

        ViewModel.markers.forEach(function(marker) {
            marker.setMap(null);
        });

        ViewModel.markers = [];

       data.restaurants.forEach(function(restaurantData) {
            if (restaurantData.name.toLowerCase().indexOf(filterText) == 0) {
                ViewModel.restaurantList.push(new ViewModel.listItem(restaurantData));
            };
        });

        if(ViewModel.restaurantList().length != 0) {
            bounds = new google.maps.LatLngBounds();
        }

        ViewModel.makeMarkers();
    },

    clearFilter: function() {
        var filterText = document.getElementById('filter').value;
        if (filterText != '') {
            document.getElementById('filter').value = '';
            ViewModel.filterList();
        }
    },
 
    makeMarkers: function() {
        for(var i = 0; i < ViewModel.restaurantList().length; i++) {
            var position = ViewModel.restaurantList()[i].location();
            var name = ViewModel.restaurantList()[i].name();
            var id = ViewModel.restaurantList()[i].id();

            var marker = new google.maps.Marker({
            map: map,
            name: name,
            position: position,
            animation: google.maps.Animation.DROP,
            id: id
            });
        
            bounds.extend(marker.position);

            marker.addListener('click', function() {
                GoogleMaps.selectMarker(this, data.selected);
            });

            ViewModel.markers.push(marker);
        }
    
    map.fitBounds(bounds);
    },

    listClick: function() {
        var id = this.id();
        ViewModel.markers.forEach(function(marker) {
            if(marker.id == id) {
                newMarker = marker;
            }
        });
        GoogleMaps.selectMarker(newMarker, data.selected);
        ViewModel.getDetails();
    },

    listToggleClick: function() {
        if (data.listShown == true ? ViewModel.hideList() : ViewModel.showList());
    },

    hideList: function() {
        $("#sidebar").addClass('hide');
        data.listShown = false;
    },

    showList: function() {
        $("#sidebar").removeClass('hide');
        data.listShown = true;
    },

    getDetails: function() {
        ViewModel.resetDetails();
   
        $.ajax({
            "url": "http://localhost:8080/business/search",
            "method": "POST",
            "data": {
                "latitude": infowindow.marker.position.lat(),
                "longitude": infowindow.marker.position.lng(),
                "name": infowindow.marker.name
            }
        }).done(function (response) {
            data.restaurant = JSON.parse(response);
            ViewModel.getReviews(data.restaurant.businesses[0].id);
        }).fail(function() {
            ViewModel.showFail();
        });

    },

    getReviews: function(id) {

        $.ajax({
            "url": "http://localhost:8080/business/reviews",
            "method": "POST",
            "data": {
                "id": id,
            }
        }).done(function (response) {
            data.reviews = JSON.parse(response);
            ViewModel.showDetails(data.restaurant.businesses[0]);
            ViewModel.showReviews(data.reviews.reviews);
        }).fail(function() {
            ViewModel.showFail();
        });;

    },

    showFail: function() {
        $('#loading').hide();
        $('#fail').fadeIn();
    },

    showReviews: function(reviews) {
        ViewModel.restaurantReviews([]);
        for(var i = 0; i < 3; i++) {
            ViewModel.restaurantReviews.push(new ViewModel.reviewItem(reviews[i]));
        }
        ViewModel.showResults();
    },
    
    showResults: function() {
        $('#loading').hide();
        $('#results').fadeIn();
    },

    resetDetails: function() {
        $('#loading').show();
        $('#results').hide();
        $('#fail').hide();
        $('#list').hide();
        $('#details').fadeIn();
    },

    showDetails: function(details) {
        ViewModel.restaurantName(details.name);
        ViewModel.restaurantAddressOne(details.location.address1);
        ViewModel.restaurantAddressTwo(details.location.address2);
        ViewModel.restaurantCity(details.location.city);
        ViewModel.restaurantState(details.location.state);
        ViewModel.restaurantZip(details.location.zip_code);
        ViewModel.restaurantPrice(details.price);
        ViewModel.restaurantRating(details.rating);
        ViewModel.restaurantCuisine(details.categories[0].title)
    },

    hideDetails: function() {
        $('#details').hide();
        $('#list').fadeIn();
    }

}

// Initialize the ViewModel
ViewModel.init();

// Apply bidings to the ViewModel
ko.applyBindings(ViewModel);