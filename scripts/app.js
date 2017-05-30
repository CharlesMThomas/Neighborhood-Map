
// Model
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

// Google Maps Functions
var GoogleMaps = {
    init: function() {
        infowindow = new google.maps.InfoWindow();

        google.maps.event.addDomListener(infowindow, 'domready', function() {
            $('#details-link').click(function(){
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

    selectMarker: function(newMarker, currentMarker) {
        if (currentMarker && newMarker != currentMarker) {
            currentMarker.setAnimation();
        }
        data.selected = newMarker;
        newMarker.setAnimation(google.maps.Animation.BOUNCE);
        map.panTo(newMarker.position);
        this.makeInfowindow(newMarker);
        ViewModel.hideList();
    },

    makeInfowindow: function(marker) {
        infowindow.marker = marker;
        infowindow.setContent('');
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
            marker.setAnimation();
            $('#details').removeClass('show');
        });

        infowindow.setContent('<div>' + marker.name + '</br></br><span id="details-link">Click for Details</span></div>');

        infowindow.open(map, marker);
    }
}

// ViewModel
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
        var filterText = document.getElementById('filter').value;
        this.restaurantList([]);

        ViewModel.markers.forEach(function(marker) {
            marker.setMap(null);
        });

        ViewModel.markers = [];

        data.restaurants.forEach(function(restaurantData) {
            if (restaurantData.name.indexOf(filterText) == 0) {
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
    },

    listToggleClick: function() {
        if (data.listShown == true) {
            this.hideList();
        } else {
            this.showList();
        }
    },

    hideList: function() {
        document.getElementById("list").classList.add('hide');
        data.listShown = false;
    },

    showList: function() {
        document.getElementById("list").classList.remove('hide');
        data.listShown = true;
    },

    getDetails: function() {

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
        });

    },

    showDetails: function(details) {
        this.restaurantName(details.name);
        this.restaurantAddressOne(details.location.address1);
        this.restaurantAddressTwo(details.location.address2);
        this.restaurantCity(details.location.city);
        this.restaurantState(details.location.state);
        this.restaurantZip(details.location.zip_code);
        this.restaurantPrice(details.price);
        this.restaurantRating(details.rating);
        this.restaurantCuisine(details.categories[0].title)
        $('#details').addClass('show');
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
        });

    },

    showReviews: function(reviews) {
        ViewModel.restaurantReviews([]);
        for(var i = 0; i < 3; i++) {
            ViewModel.restaurantReviews.push(new ViewModel.reviewItem(reviews[i]));
        }
    },

    hideDetails: function() {
        $('#details').removeClass('show');
    }

}

ViewModel.init();

ko.applyBindings(ViewModel);
