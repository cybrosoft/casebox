Ext.namespace('CB.browser.view');

Ext.define('CB.browser.view.Pivot',{
    extend: 'CB.browser.view.Interface'
    ,xtype: 'CBBrowserViewPivot'

    ,border: false
    ,tbarCssClass: 'x-panel-white'
    ,layout: 'border'
    ,activeCharts: ['table']
    ,scrollable: true

    ,initComponent: function(){

        this.params = Ext.apply(
            {
                from: 'pivot'
                // ,rows: 0
            }
            ,this.params || {}
        );

        this.seriesStyles = [];
        for (var i = 0; i < App.colors.length; i++) {
            this.seriesStyles.push({
                color: App.colors[i]
            });
        }

        this.rowsCombo = new Ext.form.ComboBox({
            xtype: 'combo'
            ,itemId: 'PVrowsCombo'
            ,selectedFacetIndex: 0
            ,forceSelection: true
            ,editable: false
            ,triggerAction: 'all'
            ,lazyRender: true
            ,queryMode: 'local'
            ,fieldLabel: L.Rows
            ,labelWidth: 'auto'
            ,style: 'margin-right: 10px'
            ,store: new Ext.data.JsonStore({
                model: 'Generic2'
            })
            ,displayField: 'name'
            ,valueField: 'id'
            ,listeners: {
                scope: this
                ,select: this.onFacetChange
            }
        });

        this.colsCombo = new Ext.form.ComboBox({
            xtype: 'combo'
            ,itemId: 'PVcolsCombo'
            ,selectedFacetIndex: 1
            ,forceSelection: true
            ,editable: false
            ,triggerAction: 'all'
            ,lazyRender: true
            ,queryMode: 'local'
            ,fieldLabel: L.Columns
            ,labelWidth: 'auto'
            ,store: new Ext.data.JsonStore({
                model: 'Generic2'
            })
            ,displayField: 'name'
            ,valueField: 'id'
            ,listeners: {
                scope: this
                ,select: this.onFacetChange
            }
        });

        this.refOwner.buttonCollection.addAll(
            new Ext.Button({
                qtip: L.Pivot
                ,text: L.Pivot
                ,itemId: 'PVtable'
                ,chart: 'table'
                ,enableToggle: true
                ,allowDepress: false
                // ,iconCls: 'ib-table'
                ,scope: this
                ,handler: this.onChangeChartButtonClick
            })
            ,new Ext.Button({
                qtip: L.ChartArea
                ,text: L.Bar
                ,itemId: 'PVbarchart'
                ,chart: 'stackedBars'
                ,enableToggle: true
                ,allowDepress: false
                // ,iconCls: 'ib-chart-bar'
                ,scope: this
                ,handler: this.onChangeChartButtonClick
            })
            ,new Ext.Button({
                qtip: L.ChartArea
                ,text: L.Column
                ,itemId: 'PVcolumnchart'
                ,chart: 'stackedColumns'
                ,enableToggle: true
                ,allowDepress: false
                // ,iconCls: 'ib-chart-column'
                ,scope: this
                ,handler: this.onChangeChartButtonClick
            })
            ,this.rowsCombo
            ,this.colsCombo
        );

        this.chartDataStore = new Ext.data.JsonStore({
            model: 'GenericCount'
            ,data: []
        });

        this.chartContainer = new Ext.Panel({
            region: 'center'
            ,scrollable: true
            ,border: false
            ,layout: {
                type: 'vbox'
                ,pack: 'top'
            }
        });

        Ext.apply(this, {
            title: L.Pivot
            ,header: false
            ,items: this.chartContainer
            ,listeners: {
                scope: this
                ,activate: this.onActivate
            }
        });

        this.callParent(arguments);

        this.enableBubble(['reload']);

        this.selectedFacets = [];

        this.store.on('load', this.onStoreLoad, this);
    }

    ,getViewParams: function() {
        this.params.selectedFacets = this.selectedFacets;

        return this.params;
    }

    ,onActivate: function() {
        this.selectedFacets = [];

        this.fireEvent(
            'settoolbaritems'
            ,[
                'PVrowsCombo'
                ,'PVcolsCombo'
                ,'->'
                ,'PVtable'
                ,'PVbarchart'
                ,'PVcolumnchart'
                ,'-'
                ,'reload'
                ,'apps'
                ,'-'
                ,'more'
            ]
        );
    }

    ,onChangeChartButtonClick: function(b, e) {
        this.activeCharts = [b.config.chart];
        // if(b.pressed) {
        //     this.activeCharts.push(b.config.chart);
        // } else {
        //     Ext.Array.remove(this.activeCharts, b.config.chart);
        // }

        this.onChangeChart();
    }

    ,onChangeChart: function() {
        var i, j
            ,BC = this.refOwner.buttonCollection
            ,showTable = (this.activeCharts.indexOf('table') > -1)
            ,showBarChart = (this.activeCharts.indexOf('stackedBars') > -1)
            ,showColumnChart = (this.activeCharts.indexOf('stackedColumns') > -1);

        BC.get('PVtable').toggle(showTable, true);
        BC.get('PVbarchart').toggle(showBarChart, true);
        BC.get('PVcolumnchart').toggle(showColumnChart, true);

        this.loadChartData();

        this.chartContainer.removeAll(true);

        if(showTable) {
            var html = '';

            var hr = '<th> &nbsp; </th>';
            Ext.iterate(
                this.pivot.titles[1]
                ,function(k, v, o) {
                    hr += '<th>' + v + '</th>';
                }
                ,this
            );
            html += '<tr>' + hr + '<th>' + L.Total + '</th></tr>';

            Ext.iterate(
                this.pivot.titles[0]
                ,function(k, v, o) {
                    var r = '<th style="text-align:left">' + v + '</th>';
                    Ext.iterate(
                        this.pivot.titles[1]
                        ,function(q, z, y) {
                            r += '<td f="' + k + '|' + q + '">' + Ext.valueFrom(this.refs[k + '_' + q], '') + '</td>';
                        }
                        ,this
                    );

                    html += '<tr>' + r + '<td class="total" f="'+ k +'|">' + Ext.valueFrom(this.refs[k + '_t'], '') + '</td></tr>';
                }
                ,this
            );

            var total = 0;
            var r = '<th>' + L.Total + '</th>';
            Ext.iterate(
                this.pivot.titles[1]
                ,function(q, z, y) {
                    var nr = Ext.valueFrom(this.refs['t_' + q], '');
                    r += '<td class="total" f="|'+ q +'">' + nr + '</td>';
                    if(!isNaN(nr)) {
                        total += nr;
                    }
                }
                ,this
            );

            html += '<tr>' + r + '<td class="total">' + total + '</td></tr>';

            html = '<table class="pivot">' + html + '</table>';

            var table = this.chartContainer.add({
                xtype: 'panel'
                ,border: false
                ,autoHeight: true
                ,padding: 10
                ,scrollable:true
                ,html: html
                ,listeners: {
                    scope: this
                    ,afterrender: function(p) {
                        var a = p.getEl().query('td');
                        for (i = 0; i < a.length; i++) {
                            Ext.get(a[i]).on('click', this.onTableCellClick, this);
                        }
                    }
                }
            });
        }

        if(showBarChart) {
            this.addChart('bar');
        }
        if(showColumnChart) {
            this.addChart('column');
        }

        this.chartContainer.updateLayout();
    }

    ,addChart: function(chartType) {
        /* create data, stores and charts on the fly */
        var series = [
                {
                    xField: this.selectedFacets[0]
                    ,yField: []
                    ,title: []
                },{
                    xField: this.selectedFacets[1]
                    ,yField: []
                    ,title: []
                }
            ]
            ,data = [[], []];

        Ext.iterate(
            this.pivot.titles[0]
            ,function(k, v, o) {
                //add fields and titles
                series[1].yField.push('f' + k);
                series[1].title.push(v);

                //add data
                var r = {};
                r[this.selectedFacets[0]] = '"' + v + '"';
                Ext.iterate(
                    this.pivot.titles[1]
                    ,function(q, z, y) {
                        var w = Ext.valueFrom(this.refs[k + '_' + q], '');
                        r['f' + q] = Ext.isEmpty(w) ? 0 : w;
                    }
                    ,this
                );
                data[0].push(r);
            }
            ,this
        );

        Ext.iterate(
            this.pivot.titles[1]
            ,function(k, v, o) {
                //add fields and titles
                series[0].yField.push('f' + k);
                series[0].title.push(v);

                //add data
                var r = {};
                r[this.selectedFacets[1]] = '"' + v + '"';
                Ext.iterate(
                    this.pivot.titles[0]
                    ,function(q, z, y) {
                        var w = Ext.valueFrom(this.refs[q + '_' + k], '');
                        r['f' + q] = Ext.isEmpty(w) ? 0 : w;
                    }
                    ,this
                );
                data[1].push(r);
            }
            ,this
        );

        var chartItems = [];

        i = 0;
        // for (i = 0; i < series.length; i++) {
            var serie = series[i];

            var cfg = {
                height: Math.max(data[i].length * 25, 400)
                ,width: '100%'
                ,store: new Ext.data.JsonStore({
                    fields: [serie.xField].concat(serie.yField)
                    ,proxy: {
                        type: 'memory'
                        ,reader: {
                            type: 'json'
                        }
                    }
                    ,data: data[i]
                })
                ,items: [{
                    type  : 'text',
                    text  : ' ',
                    x : 40, //the sprite x position
                    y : 12  //the sprite y position
                }]
                ,axes: [{
                    type: 'category'
                    ,position: (chartType == 'bar') ? 'left' : 'bottom'
                    ,fields: serie.xField
                    ,grid: true
                    ,minimum: 0
                }, {
                    type: 'numeric'
                    ,position: (chartType == 'column') ? 'left' : 'bottom'
                    ,fields: serie.yField
                    ,grid: true
                }]

                ,legend: {
                    position: 'right'
                    ,boxStrokeWidth: 0
                    // ,labelFont: '12px Helvetica'
                }
                ,seriesStyles: this.seriesStyles
                ,series: [
                    Ext.apply(
                        serie
                        ,{
                            type: chartType
                            // ,axis: 'bottom'
                            ,stacked: true
                            ,style: {
                                opacity: 0.80
                            }
                            ,highlight: {
                                'stroke-width': 2
                                ,stroke: '#fff'
                            }
                            // ,label: {
                            //     display: 'insideEnd'
                            // }
                        }
                    )
                ]
            };

            chartItems.push(
                Ext.create(
                    'Ext.chart.Chart'
                    ,cfg
                )
            );
        // }

        this.chartContainer.add(chartItems);
    }

    ,loadAvailableFacets: function() {
        var data = [];
        Ext.iterate(
            this.data.facets
            ,function(key, val, o) {
                if(Ext.isEmpty(this.selectedFacets)) {
                    this.selectedFacets = [key];
                } else if(this.selectedFacets.length < 2) {
                    this.selectedFacets[1] = key;
                }
                data.push({
                    id: key
                    ,name: Ext.valueFrom(val['title'], L['facet_'+key])
                });
            }
            ,this
        );
        this.rowsCombo.store.loadData(data);
        this.colsCombo.store.loadData(data);
        this.rowsCombo.setValue(this.selectedFacets[0]);
        this.colsCombo.setValue(this.selectedFacets[1]);
    }

    ,loadChartData: function() {
        var data = {};

        // loading facets list
        Ext.iterate(
            this.data.facets
            ,function(key, val, o) {
                data[key] = CB.FacetList.prototype.getFacetData(key, val.items);
                for (var i = 0; i < data[key].length; i++) {
                    if(Ext.isObject(data[key][i].items)) {
                        data[key][i].name = data[key][i].items.name;
                        data[key][i].count = data[key][i].items.count;
                    }
                    data[key][i].name = App.shortenString(data[key][i].name, 30);
                }
            }
            ,this
        );

        // create refs object for common usage
        this.refs = {};
        if(!Ext.isEmpty(this.data.pivot)) {
            data = this.data.pivot[this.selectedFacets.join(',')];
            if(data && data.data) {
                for (var i = 0; i < data.data.length; i++) {
                    var f1 = data.data[i];
                    if(!Ext.isEmpty(f1.pivot)) {
                        for (var j = 0; j < f1.pivot.length; j++) {
                            var f2 = f1.pivot[j];
                            this.refs[f1.value + '_' + f2.value] = f2.count;
                            if(Ext.isEmpty(this.refs['t_' + f2.value])) {
                                this.refs['t_' + f2.value] = 0;
                            }
                            if(!isNaN(f2.count)) {
                                this.refs['t_' + f2.value] += f2.count;
                            }
                        }
                    }
                    this.refs[f1.value + '_t'] = f1.count;
                }
            }
        }
    }

    ,onStoreLoad: function(store, recs, successful, eOpts) {
        if(!this.rendered ||
            !this.getEl().isVisible(true) ||
            (successful !== true)
        ) {
            return;
        }
        this.data = store.proxy.reader.rawData;

        this.pivot = {
            data: {}
            ,titles: [] // 2 levels, for both facets
        };

        if(this.data.pivot) {
            if(Ext.isEmpty(this.selectedFacets)) {
                //just get the facets the server returned the pivot for
                var key = '';
                Ext.iterate(
                    this.data.pivot
                    ,function(k, v) {
                        key = k;
                    }
                    ,this
                );
                this.selectedFacets = key.split(',');
            }

            var selectedFacets = this.selectedFacets.join(',');
            if(this.data.pivot[selectedFacets]) {
                this.pivot.data = this.data.pivot[selectedFacets].data;
                this.pivot.titles = this.data.pivot[selectedFacets].titles;
            }
        }

        if(this.viewParams) {
            var vp = this.viewParams;

            if(vp.pivot_type) {
                this.activeCharts = Ext.isString(vp.pivot_type)
                    ? [vp.pivot_type]
                    : vp.pivot_type;
            }

            if(vp.rows && !Ext.isEmpty(vp.rows.facet)) {
                this.selectedFacets[0] = vp.rows.facet;
            }
            if(vp.cols && !Ext.isEmpty(vp.cols.facet)) {
                this.selectedFacets[1] = vp.cols.facet;
            }
        }

        this.loadAvailableFacets();
        this.onChangeChart();
    }

    ,onChartItemClick: function(o){
        var rec = this.chartDataStore.getAt(o.index);
        Ext.example.msg('Item Selected', 'You chose {0}.', rec.get('name'));
    }

    ,onFacetChange: function(combo, records, index) {
        var record = Ext.isArray(records)
            ? records[0]
            : records;

        this.selectedFacets[combo.selectedFacetIndex] = record.get('id');
        this.fireEvent('reload', this);
    }

    ,onTableCellClick: function(ev, el, p) {
        if(Ext.isEmpty(el) || Ext.isEmpty(el.textContent)) {
            return;
        }
        var f = el.attributes.getNamedItem('f');
        if(Ext.isEmpty(f)) {
            return;
        }

        f = f.value.split('|');

        var params = {
            view: 'grid'
            ,filters: Ext.apply({}, this.store.extraParams.filters)
        };
        if(!Ext.isEmpty(f[0])) {
            params['filters'][this.selectedFacets[0]] = [{
                f: this.selectedFacets[0]
                ,mode: 'OR'
                ,values: [f[0]]
            }];
        }
        if(!Ext.isEmpty(f[1])) {
            params['filters'][this.selectedFacets[1]] = [{
                f: this.selectedFacets[1]
                ,mode: 'OR'
                ,values: [f[1]]
            }];
        }

        this.fireEvent('changeparams', params);
    }
});
