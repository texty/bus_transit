d3.csv('data/data_full.csv')
    .then(function (data) {

        var line = d3.radialLine()
            .curve(d3.curveBundle.beta(0.85))
            .radius(d => d.y)
            .angle(d => d.x)

        

















    });