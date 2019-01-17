/**
 * Created by ptrbdr on 11.01.19.
 */


// find the selected city in the list and scrolls to it's location,
// can use it to construct city search
// var $t = $(d3.select("#Львів" + " .cityTitle").node());
// var topOff = $t.offset().top;
// $(window).scrollTop(topOff);

d3.csv('names_without_dupicates.csv')
    .then(function (names) {
        d3.csv('coords_new.csv')
            .then(function (coords) {

                // created geojson out of basic data
                var geojson = coords.map(function (d) {
                    return {
                        type: "Feature",
                        properties: d,
                        geometry: {
                            type: "Point",
                            coordinates: [+d.Long, +d.Lat]
                        }
                    }
                });

                var nested_names = d3.nest()
                    .key(function (d) {
                        return d.first.trim();
                    })
                    .entries(names);

                var nested_data = d3.nest()
                    .key(function (d) {
                        return d.new_name.trim();
                    })
                    .map(coords);


                nested_names.forEach(function (d, i) {
                    d.values.forEach(function (dd, ii) {
                        if (nested_data['$' + dd.first.trim()] != undefined && nested_data['$' + dd.second.trim()] != undefined) {
                            nested_names[i].values[ii].coords = [[+nested_data['$' + dd.first.trim()][0].Lat, +nested_data['$' + dd.first.trim()][0].Long], [+nested_data['$' + dd.second.trim()][0].Lat, +nested_data['$' + dd.second.trim()][0].Long]]
                        }
                        else {
                            nested_names[i].values[ii].coords = 'NO'
                        }
                    })
                });

                nested_names = d3.nest().key(function (d) {
                    return d.key;
                }).map(nested_names);

                var result = names.map(function (name) {
                    if (nested_data['$' + name.first.trim()] != undefined && nested_data['$' + name.second.trim()] != undefined) {
                        return {
                            'departure': name.first,
                            'arrival': name.second,
                            'marchRoute': name.first + " - " + name.second,
                            'route_operator': name.route_operator,
                            'id': name.id,
                            'company_id': name.company_id,
                            'coords': [[+nested_data['$' + name.first.trim()][0].Lat, +nested_data['$' + name.first.trim()][0].Long], [+nested_data['$' + name.second.trim()][0].Lat, +nested_data['$' + name.second.trim()][0].Long]]
                        }
                    }
                    else {
                        return 'no'
                    }

                });

                var lineCoord = result.filter(function (d) {
                    return d != 'no'
                });

                var nested_routes = d3.nest().key(function (d) {
                    return d.id;
                }).map(lineCoord);

                const nested_operators = d3.nest().key(function (d) {
                    return 'id_' + d.company_id;
                }).map(lineCoord);


                var operator_names = d3.map(function (d) {
                    return d.route_operator.trim();
                }).entries(lineCoord);
                var city_names = d3.nest().key(function (d) {
                    return d.departure.trim();
                }).entries(lineCoord)
                    .filter(d => d.key != 'undefined');


                var states = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.whitespace,
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    // `states` is an array of state names defined in "The Basics"
                    local: city_names.map(d => d.key.trim())
                });

                $('#bloodhound .typeahead').typeahead({
                        hint: true,
                        highlight: true,
                        minLength: 1
                    },
                    {
                        name: 'states',
                        source: states
                    });


                var map = L.map('map').setView([49.272021, 31.437523], 6);


                $('#map').css('position', 'sticky');

                // var CartoDB_PositronOnlyLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
                //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
                //     subdomains: 'abcd',
                //     maxZoom: 7,
                //     minZoom: 4
                // }).addTo(map);


                var gl = L.mapboxGL({
                    accessToken: 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw',
                    maxZoom: 9,
                    minZoom: 6,
                    style: 'klokantech-basic.json'
                    // style: 'data/labels.json',
                    // pane: 'tilePane'
                }).addTo(map);

                // L.control.zoom.position('topright');


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
                var markers = L.geoJSON(geojson, {
                    pointToLayer: function (feature, latlng) {

                        try {
                            return L.circleMarker(latlng, geojsonMarkerOptions)
                        }
                        catch (err) {
                            debugger;
                        }

                    }
                }).addTo(map);

                var backgroundOverlay = (function () {
                    var frame = null;
                    var firstDraw = true;
                    var prevZoom;


                    var projectedPolygon;


                    var polygonLatLngs = [
                        [51.509, -0.08],
                        [51.503, -0.06],
                        [51.51, -0.047],
                        [51.509, -0.08]
                    ];

                    var circleCenter = [51.508, -0.11];
                    var projectedCenter;
                    var circleRadius = 85;

                    var triangle = new PIXI.Graphics();
                    triangle.popup = L.popup()
                        .setLatLng([51.5095, -0.063])
                        .setContent('I am a polygon.');
                    var circle = new PIXI.Graphics();
                    circle.popup = L.popup()
                        .setLatLng(circleCenter)
                        .setContent('I am a circle.');


                    var pixiContainer = new PIXI.Graphics();
                    pixiContainer.interactive = true;
                    pixiContainer.buttonMode = true;

                    var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

                    return L.pixiOverlay(function (utils) {
                        if (frame) {
                            cancelAnimationFrame(frame);
                            frame = null;
                        }
                        var zoom = utils.getMap().getZoom();
                        var container = utils.getContainer();
                        var anotherContainer = utils.getContainer();
                        var renderer = utils.getRenderer();
                        var project = utils.latLngToLayerPoint;
                        var scale = utils.getScale();


                        if (firstDraw) {
                            var getRenderer = utils.getRenderer;
                            utils.getMap().on('click', function (e) {
                                // not really nice but much better than before
                                // good starting point for improvements
                                var interaction = utils.getRenderer().plugins.interaction;
                                var pointerEvent = e.originalEvent;
                                var pixiPoint = new PIXI.Point();
                                // get global click position in pixiPoint:
                                interaction.mapPositionToPoint(pixiPoint, pointerEvent.clientX, pointerEvent.clientY);
                                // get what is below the click if any:
                                var target = interaction.hitTest(pixiPoint, container);
                                if (target && target.popup) {
                                    target.popup.openOn(map);
                                }
                            });

                            projectedPolygon = polygonLatLngs.map(function (coords) {
                                return project(coords);
                            });

                            projectedCenter = project(circleCenter);
                            circleRadius = circleRadius / scale;
                        }
                        if (firstDraw || prevZoom !== zoom) {

                            container.clear();

                            container.beginFill(0x00CCFF);

                            var stringToColour = function (str) {
                                var hash = 0;
                                for (var i = 0; i < str.length; i++) {
                                    hash = str.charCodeAt(i) + ((hash << 5) - hash);
                                }
                                var colour = '#';
                                for (var i = 0; i < 3; i++) {
                                    var value = (hash >> (i * 8)) & 0xFF;
                                    colour += ('00' + value.toString(16)).substr(-2);
                                }
                                return colour;
                            };


                            lineCoord.forEach(function (d) {

                                var bounds;

                                // if false it would disappear
                                container.visible = true;


                                var color = '#7e6f6f';
                                container.beginFill(0xFF3300);
                                container.lineStyle((0.5 / scale), color.replace('#', '0x'), 1);


                                // draw a shape
                                container.moveTo(project(d.coords[0]).x, project(d.coords[0]).y);
                                container.lineTo(project(d.coords[1]).x, project(d.coords[1]).y);
                                container.endFill();

                                bounds = L.bounds(L.bounds(d.coords));

                                tree.insert({
                                    minX: bounds.min.x,
                                    minY: bounds.min.y,
                                    maxX: bounds.max.x,
                                    maxY: bounds.max.y,
                                    feature: d
                                });


                            });


                        }

                        firstDraw = false;
                        prevZoom = zoom;
                        renderer.render(container);


                    }, pixiContainer, {
                        doubleBuffering: doubleBuffering,
                        autoPreventDefault: false
                    });
                })();

                var selectedOverlay = (function () {
                    var frame = null;
                    var firstDraw = true;
                    var prevZoom;


                    var pixiContainer = new PIXI.Graphics();
                    pixiContainer.interactive = true;
                    pixiContainer.buttonMode = true;

                    var selectedCity;
                    var selectedMarchRoute;
                    var selectedOperator;

                    var selected =  {name:'selectedCity', feature: nested_names['$Львів'][0].values};



                    var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

                    return L.pixiOverlay(function (utils) {
                        if (frame) {
                            cancelAnimationFrame(frame);
                            frame = null;
                        }
                        var zoom = utils.getMap().getZoom();
                        var container = utils.getContainer();
                        var renderer = utils.getRenderer();
                        var project = utils.latLngToLayerPoint;
                        var scale = utils.getScale();

                        if (firstDraw) {


                            var getRenderer = utils.getRenderer;
                            utils.getMap().on('click', function (e) {
                                // not really nice but much better than before
                                // good starting point for improvements
                                var interaction = utils.getRenderer().plugins.interaction;
                                var pointerEvent = e.originalEvent;
                                var pixiPoint = new PIXI.Point();
                                // get global click position in pixiPoint:
                                interaction.mapPositionToPoint(pixiPoint, pointerEvent.clientX, pointerEvent.clientY);
                                // get what is below the click if any:
                                var target = interaction.hitTest(pixiPoint, container);
                                if (target && target.popup) {
                                    target.popup.openOn(map);
                                }
                            });
                        }
                        if (firstDraw || prevZoom !== zoom) {


                            if (selected && selected.name == 'selectedMarchRoute') {
                                drawSelectedMarchRoute(selected);
                            }
                            if (selected && selected.name == 'selectedCity') {
                                drawSelectedCity(selected);
                            }
                            if (selected && selected.name == 'selectedOperator') {
                                drawOperators(selected, nested_operators);
                            }


                            function drawSelectedCity(selectedCity) {

                                container.clear();

                                if (selectedCity) {
                                    selectedCity.feature.forEach(function (d) {

                                        if (d.coords != 'NO') {
                                            container.visible = true;

                                            var color = '#ea3e13';
                                            container.beginFill(0xFF3300);
                                            container.lineStyle((3 / scale), color.replace('#', '0x'), 1);


                                            // draw a shape
                                            container.moveTo(project(d.coords[0]).x, project(d.coords[0]).y);
                                            container.lineTo(project(d.coords[1]).x, project(d.coords[1]).y);
                                            container.endFill();
                                        }
                                    });

                                    var march_route_list = nested_names['$' + selectedCity.feature[0].first.trim()][0];

                                    createSideNav(march_route_list);
                                }

                                setEventOnList(march_route_list);
                                operatorEvent();
                                renderer.render(container);

                            }

                            function drawSelectedMarchRoute(selected) {
                                container.clear();

                                if (selected) {
                                    createLine(selected);
                                    renderer.render(container);

                                    var march_route_list = nested_names['$' + selected.feature.departure.trim()][0];

                                    createSideNav(march_route_list);

                                }

                                setEventOnList(march_route_list);
                                operatorEvent();

                            }

                            function drawOperators(selected, nested_operators) {

                                if(selected) {

                                    container.clear();

                                    selected.feature.forEach(function (d) {

                                        if (d.coords != 'NO') {

                                            var color = '#ea3e13';
                                            container.beginFill(0xFF3300);
                                            container.lineStyle((3 / scale), color.replace('#', '0x'), 1);


                                            // draw a shape
                                            container.moveTo(project(d.coords[0]).x, project(d.coords[0]).y);
                                            container.lineTo(project(d.coords[1]).x, project(d.coords[1]).y);
                                            container.endFill();
                                        }
                                    });

                                    renderer.render(container);
                                }


                            }

                            markers.on('click', function (d) {

                                container.clear();
                                selectedCity = '$' + d.sourceTarget.feature.properties.new_name;
                                selected =  {name:'selectedCity', feature: nested_names[selectedCity][0].values};


                                if (selected) {
                                    d3.select('.table').selectAll('*').remove();
                                    drawSelectedCity(selected);
                                }


                                renderer.render(container);
                                map.flyTo([d.sourceTarget.feature.properties.Lat, d.sourceTarget.feature.properties.Long], 6);

                            });

                            map.on('click', function (d) {

                                var possibleRoutes = findRoute(d.latlng);
                                var result = measureDistance(d.latlng, possibleRoutes);


                                if (result[0]) {
                                    d3.select('.table').selectAll('*').remove();

                                    drawSelectedMarchRoute(result[0]);
                                    selected = {name:'selectedMarchRoute', feature:result[0].feature};
                                }

                                map.flyTo([d.latlng.lat, d.latlng.lng], 6);

                                $('#' + result[0].feature.company_id).siblings('.routeTitle').click();

                            });

                            map.on('mousemove', function (d) {
                                var possibleRoutes = findRoute(d.latlng);
                                var result = measureDistance(d.latlng, possibleRoutes);

                                if (result[1] === true) {
                                    document.getElementById('map').style.cursor = 'pointer';
                                }
                                else {
                                    document.getElementById('map').style.cursor = '';
                                }

                            });

                            function findRoute(latlng) {
                                // alert(point.x+ " " +point.y);
                                var features = tree.search({
                                    minX: latlng.lat,
                                    minY: latlng.lng,
                                    maxX: latlng.lat,
                                    maxY: latlng.lng
                                });

                                return features

                            }

                            function measureDistance(point, possibleRoutes) {
                                var current, state;


                                possibleRoutes.forEach(function (d) {
                                    var pt = turf.point([point.lat, point.lng]);
                                    var line = turf.lineString([d.feature.coords[0], d.feature.coords[1]]);

                                    var distance = turf.pointToLineDistance(pt, line, {units: 'miles'});

                                    var distProportion = 5 / Math.pow(2, zoom - 8);

                                    if (distance > distProportion) return;

                                    if (!current || distance < current.dist) {
                                        current = {'dist': distance, 'feature': d.feature};
                                        state = true;
                                    }

                                });

                                return [current, state];

                            }

                            function createLine(current) {

                                container.clear();

                                var color = '#ea3e13';

                                container.lineStyle(3 / scale, color.replace('#', '0x'), 1);

                                // draw a shape
                                container.moveTo(project(current.feature.coords[0]).x, project(current.feature.coords[0]).y);
                                container.lineTo(project(current.feature.coords[1]).x, project(current.feature.coords[1]).y);
                                container.endFill();

                                renderer.render(container);
                            }

                            function operatorEvent() {
                                d3.selectAll('.routeProperty').on('click', function () {

                                    if (!nested_operators['$id_' + this.id]) {alert('not working')}

                                    selected = {name:'selectedOperator', feature: nested_operators['$id_' + this.id]};

                                    drawOperators(selected, nested_operators);
                                });
                            }

                            function setEventOnList(march_route_list) {

                                d3.selectAll('.routeTitle').on('click', function () {

                                    var $t = $($(this).parent().children(1));

                                    if ($t[0].classList[1]) {
                                        // $('.open').hide('fast');
                                        // $t.removeClass('open')
                                        // $t.show("slow");
                                    }
                                    else {
                                        $('.open').hide('fast');

                                        $t.show("slow");
                                        $t.addClass('open')
                                    }

                                    var topOff = $t.offset().top - 150;
                                    $(window).scrollTop(topOff);

                                    var number = $(this).siblings('.routeProperty')[0].attributes.data;
                                    var res = march_route_list.values.filter(d => {return d.id == number.textContent})[0];

                                    res['departure'] = res.first;

                                    selected = {name:'selectedMarchRoute', feature: res};

                                    // drawSelectedMarchRoute(selected);

                                    createLine(selected);

                                });

                            }

                            $('.typeahead').on('typeahead:selected', function(evt, item) {

                                $(this).val("");


                                container.clear();
                                // selectedCity = '$' + item;
                                selected =  {name:'selectedCity', feature: nested_names['$' + item][0].values};


                                if (selected) {
                                    d3.select('.table').selectAll('*').remove();
                                    drawSelectedCity(selected);
                                }


                                renderer.render(container);
                                map.flyTo([selected.feature[0].coords[0][0], selected.feature[0].coords[0][1]], 6);



                                // // d3.select('.table *').remove();
                                // // createSideNav(nested_names['$' + item][0]);
                                // function clickOnMapItem(itemId) {
                                //     var id = parseInt(itemId);
                                //     //get target layer by it's id
                                //     var layer = marker.getLayer(id);
                                //     //fire event 'click' on target layer
                                //     layer.fireEvent('click');
                                // }
                                //
                                // markers.eachLayer(d => {
                                //     if (d.feature.properties.place_short == item) {
                                //         clickOnMapItem(d._leaflet_id);
                                //     }
                                // })

                            })

                        }

                        firstDraw = false;
                        prevZoom = zoom;
                        renderer.render(container);


                    }, pixiContainer, {
                        doubleBuffering: doubleBuffering,
                        autoPreventDefault: false
                    });
                })();

                backgroundOverlay.addTo(map);
                selectedOverlay.addTo(map);

            })
    });


function createSideNav(march_route_list) {


    d3.select('.table').selectAll('*').remove();

    d3.select('div.search p.cityName')
    .text("Обране місто: " + march_route_list.key);

    var cityNames = d3.select('div.table').append('div')
        // .text(march_route_list.key)
        // .attr('class', 'cityTitle');
//

    var routes = d3.select('div.table').selectAll('div')
        .data(march_route_list.values)
        .enter()
        .append('div')
        .attr('class', function (d) {
            return 'routeInfo'
        })
        .attr('data', function (d) {
            return d.first.trim() + ' - ' + d.second.trim()
        })
        .html(function (d) {
            return `
					<p class="routeTitle">${d.first} - ${d.second}</p>
					<p data="${ d.id }" id="${ d.company_id }" class="routeProperty">${ d.route_operator || ''}</p>
					`
        });


}



d3.xml("img/hexmap.svg", {crossOrigin: "anonymous"}).then(function(xml) {
    var navMap = d3.select("#meta-navigation").node().appendChild(xml.documentElement);

    navMap.on('click', function (d) {
        alert('g')
    });

});

