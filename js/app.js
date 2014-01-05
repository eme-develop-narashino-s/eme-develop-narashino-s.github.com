angular.module('app', []);

angular.module('app').config([
    '$locationProvider',
    '$interpolateProvider',
    '$routeProvider',
    function($locationProvider, $interpolateProvider, $routeProvider) {
        //$locationProvider.html5Mode(false);
        //$locationProvider.hashPrefix('!');
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
        //$routeProvider
        //.when('/', {templateUrl:'dailybread.html'})
        //.otherwise({redirectTo:'/'})
    }
])
.run([
    '$rootScope',
    '$route',
    function($rootScope, $route) {
        $rootScope.$on('$routeChangeSuccess', function() {
            $rootScope.title=$route.current.$$route.title;
        });
    }
]);

angular.module('app').controller('MainCtrl', [
    '$scope',
    '$location',
    '$route',
    '$document',
    function($scope, $location, $route, $document) {
        $scope.$on('$routeChangeSuccess', function() {
            angular.forEach(angular.element($document[0].querySelectorAll('ul.nav-tabs')).find('a'), function(a) {
                angular.element(a).removeClass('active');
                if (angular.element(a).attr('href').replace('#!', '')==$location.path()) {
                    angular.element(a).addClass('active');
                }
            });
        });
        //function(){
            //var menu=$('nav.header_menu_wrap');
            //var menu_top=menu.offset().top;
            //$(window).scroll(function () {
                //if ($(window).scrollTop() >= menu_top) {
                    //$('body').css({'margin-top':'40px'});
                    //menu.addClass('position_fix');
                //}else{
                    //$('body').css({'margin-top':'0'});
                    //menu.removeClass('position_fix');
                //};
            //});
        //}
    }
]);

angular.module('app').controller('DailybreadCtrl', [
    '$scope',
    '$location',
    '$route',
    '$document',
    function($scope, $location, $route, $document) {
        angular.element($document[0].querySelectorAll('#preloader > span.txt')).html('データを読み込んでいます。');
        var db=new OpenSpending.DailyBread($document[0].querySelectorAll('#dailybread > div.container'));
        new OpenSpending.Aggregator({
            apiUrl: 'http://openspending.org/api',
            //localApiCache: 'aggregate.json',
            dataset: OpenSpending.identifier,
            drilldowns: ['category', 'subcategory'],
            cuts: ['year:' + OpenSpending.year],
            rootNodeLabel: 'Total',
            breakdown: 'subcategory',
            callback: function(data) {

                //$('#content-wrap').show();
                angular.element('#content-wrap').show();
                //$('#preloader').remove();
                angular.element('#preloader').remove();

                db.setDataFromAggregator(data, ['unknown']);
                db.setIconLookup(function(name) {
                var style = OpenSpending.Styles.Cofog[name];
                if (style != undefined) {
                    return style['icon'];
                }
                    return 'icons/unknown.svg';
                });
                db.draw();
            }
        });
        OpenSpending.renderDependentTypes(db);
    }
]);

angular.module('app').controller('BubbletreeCtrl', [
    '$scope',
    '$location',
    '$route',
    '$document',
    function($scope, $location, $route, $document) {
        var $tooltip = $('<div class="tooltip">Tooltip</div>');
        $('.bubbletree').append($tooltip);
        $tooltip.hide();

        var dataLoaded = function(data) {
            window.bubbleTree = new BubbleTree({
                data: data,
                container: '#bubbletree',
                bubbleType: 'icon',
                bubbleStyles: {
                    'cofog':  OpenSpending.Styles.Cofog,
                },
                clearColors: true, // remove all colors coming from OpenSpending API
                rootPath: '/',
                tooltip: {
                    qtip: true,
                    delay: 800,
                    content: function(node) {
                        return [node.label, '<div class="desc">'+(node.description ? node.description : 'No description given')+'</div><div class="amount">\u00A5 '+node.famount+'</div>'];
                    }
                }
            });
        };

        // call openspending api for data
        new OpenSpending.Aggregator({
            apiUrl: 'http://openspending.org/api',
            //Use static file instead of api
            //localApiCache: 'aggregate.json',
            dataset: OpenSpending.identifier,
            rootNodeLabel: 'Total',
            drilldowns: ['category', 'subcategory'],
            cuts: ['year:' + OpenSpending.year],
            breakdown: 'subcategory',
            callback: dataLoaded
        });
    }
]);

