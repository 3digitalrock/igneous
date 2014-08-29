// load requirements
var ApiServer = require('apiserver'),
    modules = require('./modules');
    
    
var apiserver = new ApiServer({
  standardHeaders: {
    'cache-control': 'max-age=0, no-cache, no-store, must-revalidate',
    'x-awesome-field': 'awezing value'
  },
  timeout: 2000
})

// API v1
apiserver.addModule('v1', 'videos', new modules.Videos());
apiserver.router.addRoutes([
    ["/v1/videos", "v1/videos#index"],
    ["/v1/videos/:id", "v1/videos#video"]
]);

apiserver.listen(3001, function () {
    console.info(' ✈ ApiServer listening at http://localhst:3001');
});