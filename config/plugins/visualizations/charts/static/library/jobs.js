// dependencies
define(['utils/utils'], function(Utils) {

// widget
return Backbone.Model.extend(
{
    // initialize
    initialize: function(app, options) {
        // link app
        this.app = app;
        
        // link options
        this.options = Utils.merge(options, this.optionsDefault);
    },
    
    // clean
    cleanup: function(chart) {
        // cleanup previous dataset file
        var previous =  chart.get('dataset_id_job');
        if (previous) {
            var self = this;
            Utils.request('PUT', config.root + 'api/histories/none/contents/' + previous, { deleted: true }, function() {
                // update galaxy history
                self._refreshHdas();
            });
        }
        
    },
    
    // create job
    submit: function(chart, settings_string, columns_string, callback) {
        // link this
        var self = this;
        
        // backup chart details
        var chart_id        = chart.id;
        var chart_type      = chart.get('type');
        
        // get chart settings
        var chart_settings  = this.app.types.get(chart_type);
       
        // configure tool
        data = {
            'tool_id'       : 'rkit',
            'inputs'        : {
                'input'     : {
                    'id'    : chart.get('dataset_id'),
                    'src'   : 'hda'
                },
                'module'    : chart_type,
                'columns'   : columns_string,
                'settings'  : settings_string
            }
        }
        
        // cleanup
        self.cleanup(chart);
        
        // set chart state
        chart.state('submit', 'Sending job request...');
        
        // post job
        Utils.request('POST', config.root + 'api/tools', data,
            // success handler
            function(response) {
                if (!response.outputs || response.outputs.length == 0) {
                    chart.state('failed', 'Job submission failed. No response.');
                } else {
                    // update galaxy history
                    self._refreshHdas();
        
                    // get dataset
                    var job = response.outputs[0];
                    
                    // check dataset
                    chart.state('queued', 'Job has been queued...');
                    
                    // backup resulting dataset id
                    chart.set('dataset_id_job', job.id);
                    
                    // wait for job completion
                    self._loop(job.id, function(job) {
                        switch (job.state) {
                            case 'ok':
                                chart.state('success', 'Job completed successfully...');
                                callback(job);
                                return true;
                            case 'error':
                                chart.state('failed', 'Job has failed. Please check the history for details.');
                                return true;
                            case 'running':
                                chart.state('running', 'Job is running...');
                                return false;
                        }
                    });
                }
            },
            // error handler
            function(response) {
                var message = '';
                if (response && response.message && response.message.data && response.message.data.input) {
                    message = response.message.data.input + '.';
                }
                chart.state('failed', 'This visualization requires the R-kit. Please make sure it is installed. ' + message);
            }
        );
    },
    
    // request job details
    _loop: function(id, callback) {
        var self = this;
        Utils.request('GET', config.root + 'api/jobs/' + id, {}, function(job) {
            if (!callback(job)) {
                setTimeout(function() { self._loop(id, callback); }, self.app.config.get('query_timeout'));
            }
        });
    },
    
    // refresh history panel
    _refreshHdas: function() {
        // update galaxy history
        if (Galaxy && Galaxy.currHistoryPanel) {
            Galaxy.currHistoryPanel.refreshHdas();
        }
    }
});

});