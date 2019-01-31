var regions = (function(){

    var module = {};

    var remakeBackgroundMap = false;
    var remakeSelectedMap = false;

    module.draw = function(basic, coords, oblastData) {

        var backgroundRouteColor = '#b7acac';
        var selectedRouteColor = "#EB00FF";



        var oblastMap = 'Чернігівська область';
        //
        var names = basic.filter(function(d) {return d.regulative_institution == oblastMap});

        var tree = rbush();

        d3.select('h4#currentOblast').text("На карті: " + oblastMap);


        var nested_data = d3.nest()
            .key(function (d) {
                return d.new_name.trim();
            })
            .map(coords);


        basic.forEach(function (d, i) {

            if (nested_data['$' + d.first.trim()] != undefined && nested_data['$' + d.second.trim()] != undefined) {
                basic[i].coords = [[+nested_data['$' + d.first.trim()][0].Lat, +nested_data['$' + d.first.trim()][0].Long], [+nested_data['$' + d.second.trim()][0].Lat, +nested_data['$' + d.second.trim()][0].Long]]
            }
            else {
                basic[i].coords = 'NO'
            }
        });

        basic = basic.filter(d => d.coords != 'NO');

        var cityNamesForCount = basic.map(d => d.first);
        var aCount = new Map([...new Set(cityNamesForCount)].map(
            x => [x, cityNamesForCount.filter(y => y === x).length]
        ));


        var nested_names = d3.nest()
            .key(function (d) {
                return d.first.trim();
            })
            .entries(basic.filter(function(d) {return d.regulative_institution != 'Україна'}));

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
                    'bus_age': name.bus_age,
                    'bus_comfort_level': name.bus_comfort_level,
                    'drives_per_day': name.drives_per_day,
                    'license_data': name.license_data,
                    'number_of_buses': name.number_of_buses,
                    'route_regularity': name.route_regularity,
                    'coords': [[+nested_data['$' + name.first.trim()][0].Lat, +nested_data['$' + name.first.trim()][0].Long], [+nested_data['$' + name.second.trim()][0].Lat, +nested_data['$' + name.second.trim()][0].Long]],
                    'regulative_institution': name.regulative_institution,
                    'count': name.count
                }
            }
            else {
                return 'no'
            }

        });

        var lineCoord = result.filter(function (d) {
            return d != 'no'
        });

        var selected =  {name:'selectedCity', feature: nested_names['$Чернігів'][0].values};

        const nested_operators = d3.nest().key(function (d) {
            return 'id_' + d.company_id;
        }).map(lineCoord);

        var city_names = d3.nest().key(function (d) {
            return d.departure.trim();
        }).entries(lineCoord)
            .filter(d => d.key != 'undefined');


        var oblast_map = {
            "ВЛ": {'name':'Волинська область', 'city': 'Луцьк', 'status': true},
            "ІФ": {'name':"Івано-Франківська область", 'city': 'Івано-Франківськ', 'status': true},
            "ХМ": {'name':"Хмельницька область", 'city': 'Хмельницький', 'status': false},
            "ЗК": {'name':"Закарпатська область", 'city': 'Ужгород', 'status': false},
            "КВ": {'name':"Київська область", 'city': 'Київ', 'status': false},
            "РВ": {'name':"Рівненська область", 'city': 'Рівне', 'status': true},
            "ЛВ": {'name':"Львівська область", 'city': 'Львів', 'status': false},
            "ТР": {'name':"Тернопільська область", 'city': 'Тернопіль', 'status': false},
            "СМ": {'name':"Сумська область", 'city': 'Суми', 'status': true},
            "ЧГ": {'name':"Чернігівська область", 'city': 'Чернігів', 'status': true},
            "ДН": {'name':"Дніпропетровська область", 'city': 'Дніпропетровськ', 'status': false},
            "ДО": {'name':"Донецька область", 'city': 'Краматорськ', 'status': true},
            "ЗП": {'name':"Запорізька область", 'city': 'Запоріжжя', 'status': true},
            "ХР": {'name':"Херсонська область", 'city': 'Херсон', 'status': true},
            "ОД": {'name':"Одеська область", 'city': 'Одеса', 'status': true},
            "ЧН": {'name':"Чернівецька область", 'city': 'Чернівці', 'status': false},
            "КР": {'name':"Автономна республіка Крим", 'city': 'Севастополь', 'status': false},
            "ЖТ": {'name':"Житомирська область", 'city': 'Житомир', 'status': true},
            "ПЛ": {'name':"Полтавська область", 'city': 'Полтава', 'status': true},
            "ХК": {'name':"Харківська область", 'city': 'Харків', 'status': false},
            "ЛГ": {'name':"Луганська область", 'city': 'Сєвєродонецьк', 'status': true},
            "ЧК": {'name':"Черкаська область", 'city': 'Черкаси', 'status': true},
            "КГ": {'name':"Кіровоградська область", 'city': 'Кропивницький', 'status': true},
            "МК": {'name':"Миколаївська область", 'city': 'Миколаїв', 'status': true},
            "ВН": {'name':"Вінницька область", 'city': 'Вінниця', 'status': false}
        };

        d3.xml("img/hexmap (1).svg", {crossOrigin: "anonymous"}).then(function(xml) {
            var navMap = d3.select("#meta-navigation").node().appendChild(xml.documentElement);

            $('#Layer_1 text').on('click', d => {

                $('.selected').removeClass( "selected").addClass('st1');
                $(d.target).removeClass('st1').addClass( "selected");


                var selected_oblast = oblast_map[d.currentTarget.innerHTML];
                if (selected_oblast.status == false) {return false}

                oblastMap = selected_oblast.name;
                selected = {name:'selectedCity', feature: nested_names['$' + selected_oblast.city][0].values};


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
                            'regulative_institution': name.regulative_institution,
                            'count': name.count
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

                if (oblastBoundary) {
                    map.removeLayer(oblastBoundary);
                }
                geo = oblastData.features.filter(d => d.properties.LABEL == oblastMap);
                oblastBoundary = L.geoJSON(geo[0], {
                    color:"#968787",
                    fill: "#000",
                    weight:1,
                    // stroke-width:1,
                    fillOpacity: 0,
                    opacity: 0.5,
                    bubblingMouseEvents: false
                }).addTo(map);

                map.removeLayer(markers);

                var dataForMarkers = [];
                lineCoord.forEach(d => {
                    var a = JSON.parse(JSON.stringify( d ));
                    var b = JSON.parse(JSON.stringify( d ));

                    a.coords = d.coords[0];
                    a.status = true;
                    b.coords = d.coords[1];
                    b.status = false


                    dataForMarkers.push(a);
                    dataForMarkers.push(b);
                });

                // потрібно ще додати фільтр на ту область
                geojson = dataForMarkers.map(function (d) {
                    d.status == true ? d.counts = aCount.get(d.departure) : d.counts = 1;

                    return {
                        type: "Feature",
                        properties: d,
                        geometry: {
                            type: "Point",
                            coordinates: [+d.coords[1], +d.coords[0]]
                        }
                    }
                });


                var max = d3.max(geojson.map(d => d.properties.counts));


                var scale = d3.scaleLog()
                    .domain([1, max]) // input
                    .range([3, 10]); // output

                console.log("_______________________________")

                //created leaflet markers
                console.log("add markers");
                markers = L.geoJSON(geojson, {
                    pointToLayer: function (feature, latlng) {

                        return L.circleMarker(latlng, {
                            radius: scale(feature.properties.counts),
                            fillColor: "#808080",
                            color: "#000",
                            weight: 0,
                            opacity: 1,
                            fillOpacity: 0.5,
                            bubblingMouseEvents: false
                        })

                    }
                }).addTo(map);

                console.log("SET FLAGS = TRUE");
                remakeBackgroundMap = true, remakeSelectedMap = true;

                console.log("fit bounds");
                map.fitBounds(markers.getBounds());
                // map.flyTo([d.sourceTarget.feature.properties.Lat, d.sourceTarget.feature.properties.Long], 6);



                var city_names = d3.nest().key(function (d) {
                    return d.departure.trim();
                }).entries(lineCoord)
                    .filter(d => d.key != 'undefined');


                states.clear();
                states.local = city_names.map(d => d.key.trim());
                states.initialize(true);


            });

            $('#Layer_1 text').on('mouseover', d => {
                d.target.style.fill = '#eb00ff'
            });
            $('#Layer_1 text').on('mouseout', d => {
                d.target.style.fill = ''
            });

        });


        var states = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.whitespace,
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            // `states` is an array of state names defined in "The Basics"
            local: city_names.map(d => d.key.trim())
        });

        $('#bloodhound-regions .typeahead-regions').typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            },
            {
                name: 'states',
                source: states
            });
        var map = L.map('map-regions', { zoomControl:false })//.setView([49.272021, 31.437523], 6);

        var geo = oblastData.features.filter(d => d.properties.LABEL == oblastMap);
        var oblastBoundary = L.geoJSON(geo[0], {
            color:"#968787",
            fill: "#000",
            weight:1,
            // stroke-width:1,
            fillOpacity: 0,
            opacity: 0.5,
            bubblingMouseEvents: false
        }).addTo(map);


        $('#map').css('position', 'sticky');



        var gl = L.mapboxGL({
            accessToken: 'pk.eyJ1IjoiZHJpbWFjdXMxODIiLCJhIjoiWGQ5TFJuayJ9.6sQHpjf_UDLXtEsz8MnjXw',
            maxZoom: 9,
            minZoom: 6,
            style: 'regions.json'
            // style: 'data/labels.json',
            // pane: 'tilePane'
        }).addTo(map);



        // var geojsonMarkerOptions = {
        //     radius: 4,
        //     fillColor: "#808080",
        //     color: "#000",
        //     weight: 0,
        //     opacity: 1,
        //     fillOpacity: 0.5,
        //     bubblingMouseEvents: false
        // };
        var tree = rbush();

        // created geojson out of basic data
        var geojson = lineCoord.map(function (d) {
            return {
                type: "Feature",
                properties: d,
                geometry: {
                    type: "Point",
                    coordinates: [+d.coords[0][1], +d.coords[0][0]]
                }
            }
        });


        //created leaflet markers
        var markers = L.geoJSON(geojson, {
            pointToLayer: function (feature, latlng) {

                try {
                    return L.circleMarker(latlng, {
                        radius: scale(feature.properties.counts),
                        fillColor: "#808080",
                        color: "#000",
                        weight: 0,
                        opacity: 1,
                        fillOpacity: 0.5,
                        bubblingMouseEvents: false
                    })
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



            var pixiContainer = new PIXI.Graphics();
            pixiContainer.interactive = true;
            pixiContainer.buttonMode = true;

            var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            return L.pixiOverlay(function (utils) {
                console.log('pixi background hello')
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

                    // projectedPolygon = polygonLatLngs.map(function (coords) {
                    //     return project(coords);
                    // });
                    //
                    // projectedCenter = project(circleCenter);
                    // circleRadius = circleRadius / scale;
                }

                if (firstDraw || prevZoom !== zoom || remakeBackgroundMap == true) {
                    console.log("backgound draw");
                    console.log("zoom !== prevZoom : " + (prevZoom !== zoom) + ", remakeBackgroundMap: " + remakeBackgroundMap);
                    // console.log("pixi draw");
                    // console.log('event draw');

                    container.clear();

                    // container.beginFill(0x00CCFF);

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

                        // var backgroundRouteColor = '#b7acac';
                        // container.beginFill(0xFF3300);
                        container.lineStyle((0.5 / scale), backgroundRouteColor.replace('#', '0x'), 0.5);

                        var distance = turf.distance(turf.point(d.coords[0]), turf.point(d.coords[1]));
                        var num = Math.random(0,10); // this will get a number between 1 and 99;

                        num = (distance/600)*num;
                        // num *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases

                        var midPoint = turf.midpoint(turf.point(d.coords[0]), turf.point(d.coords[1])).geometry.coordinates;
                        midPoint = [midPoint[0]+num, midPoint[1]+num];
                        //
                        // // draw a shape
                        container.moveTo(project(d.coords[0]).x, project(d.coords[0]).y);
                        //
                        container.quadraticCurveTo(project(midPoint).x, project(midPoint).y, project(d.coords[1]).x, project(d.coords[1]).y);
                        // container.lineTo(project(d.coords[1]).x, project(d.coords[1]).y);


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
                    // console.log(lineCoord)
                    remakeBackgroundMap = false;
                    console.log("remakeBackground = false")

                }

                firstDraw = false;
                // remakeMap == false;
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


                var cont = [];



// Показує які маркери на території, що ти вибрав
                markers.eachLayer(function(l) {
                    if( map.getBounds().contains(l.getLatLng()) )
                        cont.push(l.feature.properties.old_name + " " + l.feature.geometry.coordinates);
                });


                if (firstDraw || prevZoom !== zoom || remakeSelectedMap == true) {
                    console.log("selected draw");
                    console.log("zoom !== prevZoom : " + (prevZoom !== zoom) + ", remakeSelectedMap: " + remakeSelectedMap);

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


                                    // container.beginFill(0xFF3300);
                                    container.lineStyle((2 / scale), selectedRouteColor.replace('#', '0x'), 0.5);

                                    var distance = turf.distance(turf.point(d.coords[0]), turf.point(d.coords[1]));
                                    var num = Math.random(0,10); // this will get a number between 1 and 99;

                                    num = (distance/600)*num;
                                    // num *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases

                                    var midPoint = turf.midpoint(turf.point(d.coords[0]), turf.point(d.coords[1])).geometry.coordinates;
                                    midPoint = [midPoint[0]+num, midPoint[1]+num];
                                    //
                                    // // draw a shape
                                    container.moveTo(project(d.coords[0]).x, project(d.coords[0]).y);
                                    //
                                    container.quadraticCurveTo(project(midPoint).x, project(midPoint).y, project(d.coords[1]).x, project(d.coords[1]).y);
                                    // container.lineTo(project(d.coords[1]).x, project(d.coords[1]).y);

                                    container.endFill();
                                }
                            });

                            var march_route_list = nested_names['$' + selectedCity.feature[0].first.trim()][0];

                            createSideNav(march_route_list);
                            //here to click
                        }

                        setEventOnList(march_route_list);
                        operatorEvent();
                        renderer.render(container);

                    }

                    function drawSelectedMarchRoute(selected) {
                        container.clear();

                        if (selected || selected.feature.regiregulative_institution ==  oblastMap) {
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

                                    container.lineStyle((2 / scale), selectedRouteColor.replace('#', '0x'), 0.5);

                                    var distance = turf.distance(turf.point(d.coords[0]), turf.point(d.coords[1]));
                                    var num = Math.random(0,10); // this will get a number between 1 and 99;

                                    num = (distance/1000)*num;
                                    // num *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases

                                    var midPoint = turf.midpoint(turf.point(d.coords[0]), turf.point(d.coords[1])).geometry.coordinates;
                                    midPoint = [midPoint[0]+num, midPoint[1]+num];
                                    //
                                    // // draw a shape
                                    container.moveTo(project(d.coords[0]).x, project(d.coords[0]).y);
                                    //
                                    container.quadraticCurveTo(project(midPoint).x, project(midPoint).y, project(d.coords[1]).x, project(d.coords[1]).y);
                                    // container.lineTo(project(d.coords[1]).x, project(d.coords[1]).y);

                                    container.endFill();
                                }
                            });

                            renderer.render(container);
                        }


                    }

                    markers.on('click', function (d) {

                        container.clear();
                        selectedCity = '$' + d.sourceTarget.feature.properties.departure;
                        selected =  {name:'selectedCity', feature: nested_names[selectedCity][0].values};


                        if (selected) {
                            d3.select('.table-region').selectAll('*').remove();
                            drawSelectedCity(selected);
                        }


                        renderer.render(container);
                        // map.flyTo([d.sourceTarget.feature.properties.Lat, d.sourceTarget.feature.properties.Long], 6);

                    });

                    markers.on('mouseover', d => {
                        d.layer.setStyle({fillColor: selectedRouteColor});
                        var popup = L.popup()
                            .setLatLng(d.latlng)
                            .setContent(d.layer.feature.properties.departure)
                            .openOn(map);

                    });
                    markers.on('mouseout', d => {
                        d.layer.setStyle({fillColor: "#929292"});
                    });

                    map.on('click', function (d) {

                        var possibleRoutes = findRoute(d.latlng);
                        var result = measureDistance(d.latlng, possibleRoutes);

                        console.log(result);


                        if (result[0] || result[0].feature.regulative_institution ==  selected_oblast) {
                            console.log('that was correct');

                            d3.select('.table-region').selectAll('*').remove();

                            drawSelectedMarchRoute(result[0]);
                            selected = {name:'selectedMarchRoute', feature:result[0].feature};

                            // map.flyTo([d.latlng.lat, d.latlng.lng], 6);

                            $('[data=' + result[0].feature.id + ']').siblings('.routeTitle').click();
                        }
                        else {
                            console.log("that wasn't correct")

                        }


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

                        // selectedRouteColor = '#B1EA00';

                        // container.beginFill(0xFF3300);
                        container.lineStyle((2 / scale), selectedRouteColor.replace('#', '0x'), 0.5);

                        var distance = turf.distance(turf.point(current.feature.coords[0]), turf.point(current.feature.coords[1]));
                        var num = Math.random(0,10); // this will get a number between 1 and 99;

                        num = (distance/1000)*num;
                        // num *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases

                        var midPoint = turf.midpoint(turf.point(current.feature.coords[0]), turf.point(current.feature.coords[1])).geometry.coordinates;
                        midPoint = [midPoint[0]+num, midPoint[1]+num];
                        //
                        // // draw a shape
                        container.moveTo(project(current.feature.coords[0]).x, project(current.feature.coords[0]).y);
                        //
                        container.quadraticCurveTo(project(midPoint).x, project(midPoint).y, project(current.feature.coords[1]).x, project(current.feature.coords[1]).y);
                        // container.lineTo(project(d.coords[1]).x, project(d.coords[1]).y);

                        renderer.render(container);
                    }

                    function operatorEvent()
                    {
                        d3.selectAll('.routeProperty').on('click', function () {

                            // if (!nested_operators['$id_' + this.id]) {alert('not working')}

                            selected = {name:'selectedOperator', feature: nested_operators['$id_' + this.id]};

                            drawOperators(selected, nested_operators);
                        });
                    }



                    function setEventOnList(march_route_list) {

                        d3.selectAll('.routeTitle').on('click', function () {

                            $('p.routeProperty.open').hide('fast');
                            $('.open').removeClass('open');


                            var $t = $($(this).parent().children(1));
                            $t.addClass('open');

                            $t.show("slow");

                            // var topOff = $t.offset().top;
                            // $(window).scrollTop(topOff);

                            // window.scrollTo(0, 0);


                            var number = $(this).siblings('.routeProperty')[0].attributes.data;
                            var res = march_route_list.values.filter(d => {return d.id == number.textContent})[0];

                            res['departure'] = res.first;

                            selected = {name:'selectedMarchRoute', feature: res};

                            // drawSelectedMarchRoute(selected);

                            createLine(selected);

                        });

                    }

                    $('.typeahead-regions').on('typeahead:selected', function(evt, item) {

                        $(this).val("");


                        container.clear();
                        // selectedCity = '$' + item;
                        selected =  {name:'selectedCity', feature: nested_names['$' + item][0].values};


                        if (selected) {
                            d3.select('.table-region').selectAll('*').remove();
                            drawSelectedCity(selected);
                        }


                        renderer.render(container);
                        // map.flyTo([selected.feature[0].coords[0][0], selected.feature[0].coords[0][1]], 6);



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

                    remakeSelectedMap = false;
                    console.log("remakeSelected = false")

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

        function createSideNav(march_route_list) {


            march_route_list.values = march_route_list.values
                .sort((a, b) => a.second.localeCompare(b.second));


            d3.select('.table-region').selectAll('*').remove();

            // d3.select('div.search p.cityName-regions')
            //     .text("Обране місто: " + march_route_list.key);

            d3.select('div.search .cityName-regions b p')
                .text( march_route_list.key );

            var cityNames = d3.select('div.table-region').append('div');
            // .text(march_route_list.key)
            // .attr('class', 'cityTitle');
//

            var occurance = [];


            var routes = d3.select('div.table-region').selectAll('div')
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
                    var ind = occurance.findIndex(dd => dd.name === d.second);

                    if (ind > 0) {
                        occurance[ind].count += 1;
                    }
                    else {
                        occurance.push({name:d.second, count:1});
                        ind = occurance.findIndex(dd => dd.name === d.second);
                    }

                    var title;
                    if (occurance[ind].count > 1) {
                        title = occurance[ind].name + " (" +  occurance[ind].count + ")"
                    }
                    else {
                        title = occurance[ind].name
                    }

                    return `
					<p class="routeTitle">${title}</p>
					<p data="${ d.id }" title="Показати всі маршрути цієї компанії" style="color: #eb00ff" id="${ d.company_id }" class="routeProperty">${ 'Перевізник: ' + d.company_name || 'Перевізник: немає даних'}</p>
					<p class="routeProperty">${ 'Тривалість ліцензії: ' + d.license_data || 'Тривалість ліцензії: немає даних'}</p>
					<p class="routeProperty">${ 'Найстарший автобус на маршруті: ' + d.bus_age || 'Найстарший автобус на маршруті: немає даних'}</p>
					<p class="routeProperty">${ 'Клас комфортності автобусів: ' + d.bus_comfort_level || 'Клас комфортності автобусів: немає даних'}</p>
					<p class="routeProperty">${ 'Частота: ' + d.route_regularity || 'Частота: немає даних'}</p>
					`
                });




        }
    };



    return module;
})();