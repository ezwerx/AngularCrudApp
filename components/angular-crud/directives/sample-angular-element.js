///<reference path='../angularjs/angular.d.ts' />
///<reference path='../lodash/lodash.d.ts' />
///<reference path='../references.ts' />
/**
* Created by Bob on 5/15/2014.
*/
angular.module('angularCrud').directive('sampleAngularElement', function () {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'components/angular-crud/directives/sample-angular-element.html',
        scope: {
            myName: '@'
        }
    };
});
//# sourceMappingURL=sample-angular-element.js.map
