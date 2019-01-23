var main_list = (function(){
    
    var module = {};
    
    var data = []
        , container
        , on_city_selected = function(){}
        , svg
    
    module.data = function(val) {
        data = val;
        return module;
    };

    module.container = function(val) {
        data = val;
        return module;
    };
    
    module.draw = function() {
        svg = d3.select(container)
            .data(data)
            .enter()
            .append("li")
            .on("click", function(d){
                d3.select(this).style();
                
                on_city_selected(d);
            })
        
     
    };
    
    module.redraw = function(city) {
        
        
    }
    
    
    module.onCitySelected = function(val) {
        on_city_selected = val;
        return module;
    };




    return module;
})();

d3.xml("img/hexmap.svg", {crossOrigin: "anonymous"}).then(function(xml) {
    var navMap = d3.select("#meta-navigation").node().appendChild(xml.documentElement);

    $('#Layer_1 text').on('click', d => {

        var selected_oblast = oblast_map[d.currentTarget.innerHTML];
        if (selected_oblast.status == false) {return false}

        names = basic.filter(function(d) {return d.regulative_institution == selected_oblast.name});
        result = names.map(function (name) {
            if (nested_data['$' + name.first.trim()] != undefined && nested_data['$' + name.second.trim()] != undefined) {
                return {
                    'departure': name.first,
                    'arrival': name.second,
                    'marchRoute': name.first + " - " + name.second,
                    'route_operator': name.route_operator,
                    'id': name.id,
                    'company_id': name.company_id,
                    'bus_age': name.bus_age,
                    'bus_comfort_level': name.bus_comfort_level,
                    'drives_per_day': name.drives_per_day,
                    'license_data': name.license_data,
                    'number_of_buses': name.number_of_buses,
                    'route_regularity': name.route_regularity,
                    'coords': [[+nested_data['$' + name.first.trim()][0].Lat, +nested_data['$' + name.first.trim()][0].Long], [+nested_data['$' + name.second.trim()][0].Lat, +nested_data['$' + name.second.trim()][0].Long]],
                    'regiregulative_institution': name.regulative_institution
                }
            }
            else {
                return 'no'
            }

        });

        lineCoord = result.filter(function (d) {
            return d != 'no'
        });
        tree = rbush();

        map.removeLayer(markers);

        // потрібно ще додати фільтр на ту область
        geojson = lineCoord.map(function (d) {
            return {
                type: "Feature",
                properties: d,
                geometry: {
                    type: "Point",
                    coordinates: [+d.coords[0][0], +d.coords[0][1]]
                }
            }
        });

        var geojsonMarkerOptions = {
            radius: 4,
            fillColor: "#808080",
            color: "#000",
            weight: 0,
            opacity: 1,
            fillOpacity: 0.8,
            bubblingMouseEvents: false
        };
        var tree = rbush();

        //created leaflet markers
        markers = L.geoJSON(geojson, {
            pointToLayer: function (feature, latlng) {

                try {
                    L.circleMarker(latlng, geojsonMarkerOptions)
                }
                catch (err) {
                    console.log('gg');
                }

            }
        }).addTo(map);

    });

    $('#Layer_1 text').on('mouseover', d => {
        d.target.style.fill = '#ea3e13'
    });
    $('#Layer_1 text').on('mouseout', d => {
        d.target.style.fill = ''
    });

});
