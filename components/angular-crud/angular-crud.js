///<reference path='typings/angularjs/angular.d.ts' />
///<reference path='references.ts' />
/**
* Created by Bob on 5/23/2014.
*/
/**
* @ngdoc module
* @name angularCrud
* @description
*
* # angularCrud (core module)
* The angularCrud module ????
*
* <div doc-module-components="angularCrud"></div>
*/
angular.module('angularCrud', ['ngResource']);
/**
* Created by Bob on 5/17/2014.
*/
var filters = angular.module('angularCrud', []);

filters.filter('booleanAsYesNo', function () {
    return function (input) {
        return input ? 'Yes' : 'No';
    };
});
///<reference path='filters.ts' />
///<reference path='../typings/angularjs/angular.d.ts' />
///<reference path='references.ts' />
/**
* Created by Bob on 5/5/2014.
*/
/**
* @area api
* @module angularCrud
* @ngdoc directive
* @name crudAutofocus
* @element input
* @restrict A
* @param {expression} crudAutofocus If the expression is truthy, then the control will gain focus when the view is ready.
* @description
* Helper directive to place focus on the first form field. If multiple fields are marked with this attribute, then focus
* will be placed on the first field.
*/
angular.module('angularCrud').directive('crudAutofocus', [
    '$timeout', function ($timeout) {
        "use strict";

        /* hello world from milwaukee */
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(attrs.crudAutofocus, function (value) {
                    if (angular.isDefined(value) && value) {
                        element[0].focus();
                        element[0].select();
                    }
                }, true);
            }
        };
    }]);
///<reference path='references.ts' />
/**
* Created by Bob on 5/15/2014.
*/
/**
* @area api
* @module angularCrud
* @ngdoc directive
* @name crudEditableForm
* @restrict E
* @param {string} form-id Form ID.
* @param {expression} crud-show-editable If the expression is truthy, then the form will show in edit mode by default.
* @param {expression} readonly If the expression is truthy, then the form will display in read only mode and the user will not be allowed to make changes.
* @description
* FIS extension of the x-editable form. Provides standard layout and actions.
*/
angular.module('angularCrud').directive('crudEditableForm', function () {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'components/angular-crud/directives/editable-form.html',
        scope: {
            fisShowEditable: '&',
            fisId: '@'
        },
        link: function (scope, element, attrs) {
            if (scope.fisId && scope.fisId != 'thisForm') {
                scope.thisForm = scope[scope.fisId];
            }
            var toggleEditableForm = function (value) {
                "use strict";
                var formId = scope.fisId || 'thisForm';
                var editableForm = scope[formId];
                if (editableForm) {
                    if (angular.isDefined(value) && value) {
                        editableForm.$show();
                    } else {
                        editableForm.$cancel();
                    }
                }
            };
            scope.$watch(scope.fisShowEditable, function (value) {
                if (value) {
                    toggleEditableForm(value);
                }
            }, true);
        }
    };
});
///<reference path='references.ts' />
/**
* Created by Bob on 5/5/2014.
*/
angular.module('angularCrud').directive('fisShowEditableForm', [
    '$timeout', function ($timeout) {
        "use strict";
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(attrs.fisShowEditableForm, function (value, element) {
                    if (angular.isDefined(value) && value) {
                        var editableForm = scope.$eval(attrs.crudEditableForm);
                        editableForm.$show();
                    } else {
                        editableForm.$cancel();
                    }
                }, true);
            }
        };
    }]);
///<reference path='autofocus.ts' />
///<reference path='editable-form.ts' />
///<reference path='show-editable-form.ts' />
///<reference path='../typings/angularjs/angular.d.ts' />
///<reference path='references.ts' />
/**
* Created by Bob on 5/4/2014.
*/
var MetadataService = (function () {
    function MetadataService($resource) {
        "use strict";
        this.resource = $resource('app/:resourceName/:formTag-metadata.json', {}, {});
    }
    MetadataService.prototype.get = function (params) {
        "use strict";
        return this.resource.get({ resourceName: params.resourceName, formTag: params.formTag }).$promise;
    };
    return MetadataService;
})();

angular.module('angularCrud').factory('MetadataService', ['$resource', function ($resource) {
        return new MetadataService($resource);
    }]);
///<reference path='metadata-service-file.ts' />
///<reference path='../typings/lodash/lodash.d.ts' />
///<reference path='references.ts' />
/**
* Created by Bob on 5/5/2014.
*/
/**
* @area api
* @module angularCrud
* @ngdoc type
* @name BaseController
* @param {object} context ????.
* @description
* ????
*/
var BaseController = (function () {
    function BaseController(context) {
        "use strict";
        this.context = context;

        //this.resourceName = params.resourceName;
        //this.formTag = params.formTag;
        //this.$routeParams = $routeParams;
        //this.$location = $location;
        //this.service = ResourceService;
        //this.metadataService = MetadataService;
        this.resetFocus = true;
        this.isModelLoaded = false;
        this.showEditable = false;
        this.isReadonly = true;
        this.viewModel = {};
        this.metadataBase = { "form": { "tabs": {}, "sections": {} } };
        this.metadata = {};
        this.refreshMetadata({});
        this.init();
    }
    BaseController.prototype.init = function () {
        "use strict";
        this.getFormMetadata();
    };

    BaseController.prototype.getFormMetadata = function () {
        var _this = this;
        "use strict";
        this.context.metadataService.get({ resourceName: this.context.resourceName, formTag: this.context.formTag }).then(function (result) {
            return _this.onGetFormMetadataSuccess(result);
        }).catch(function (result) {
            return _this.onGetFormMetadataError(result);
        });
    };

    BaseController.prototype.onGetFormMetadataSuccess = function (result) {
        "use strict";
        console.log('onGetFormMetadataSuccess');
        this.metadataBase = { "form": { "tabs": {}, "sections": {} } };
        _.merge(this.metadataBase, result);
        this.metadata = {};
        this.refreshMetadata({});
        this.getData();
    };

    BaseController.prototype.isTrue = function (value, defaultValue) {
        "use strict";
        return (value == undefined) ? defaultValue : value;
    };

    BaseController.prototype.collapseAll = function () {
        "use strict";
        var _this = this;
        Object.keys(this.metadata.form.sections).forEach(function (sectionKey) {
            var section = _this.metadata.form.sections[sectionKey];
            section.isOpen = false;
        });
    };

    BaseController.prototype.expandAll = function () {
        "use strict";
        var _this = this;
        Object.keys(this.metadata.form.sections).forEach(function (sectionKey) {
            var section = _this.metadata.form.sections[sectionKey];
            section.isOpen = true;
        });
    };

    BaseController.prototype.onGetFormMetadataError = function (result) {
        "use strict";
        console.log('onGetFormMetadataError');
        this.getData();
    };

    BaseController.prototype.getData = function () {
        "use strict";
    };

    /*
    getChoiceGroups(){
    "use strict";
    this.context.resourceService
    .getList({resourceName: 'choice-groups'})
    .then((result) => this.onGetChoiceGroupsSuccess(result))
    .catch((result) => this.onGetChoiceGroupsError(result));
    }
    
    onGetChoiceGroupsSuccess(result) {
    "use strict";
    this.choiceGroups = {};
    for(var i=0,len=result.length;i<len;i++){
    this.choiceGroups[result[i].key] = result[i].value;
    }
    }
    
    onGetChoiceGroupsError(result) {
    "use strict";
    this.messages = 'Error'
    }
    */
    BaseController.prototype.getList = function () {
        var _this = this;
        "use strict";
        this.resetFocus = false;
        this.isModelLoaded = false;
        this.context.resourceService.getList({ resourceName: this.context.resourceName }).then(function (result) {
            return _this.onGetListSuccess(result);
        }).catch(function (result) {
            return _this.onGetListError(result);
        });
    };

    BaseController.prototype.onGetListSuccess = function (result) {
        "use strict";
        this.messages = 'Success';
        this.viewModel = result;
        this.resetFocus = true;
        this.isModelLoaded = false;
    };

    BaseController.prototype.onGetListError = function (result) {
        "use strict";
        this.messages = 'Error';
    };

    BaseController.prototype.createItem = function (item) {
        var _this = this;
        "use strict";
        this.resetFocus = false;
        this.isModelLoaded = false;
        this.showEditable = false;
        this.isReadonly = true;
        this.context.resourceService.createItem({ resourceName: this.context.resourceName }, item).then(function (item) {
            return _this.onCreateSuccess(item);
        }).catch(function (item) {
            return _this.onCreateError(item);
        });
    };

    BaseController.prototype.onCreateSuccess = function (result) {
        "use strict";
        this.messages = 'Success';
        this.isModelLoaded = false;
        this.showEditable = true;
        this.isReadonly = false;

        //this.context.$location.path(this.context.resourceName);
        if (result.metadata != undefined) {
            this.refreshMetadata(result.metadata);
        }
    };

    BaseController.prototype.onCreateError = function (result) {
        "use strict";
        this.messages = 'Error';
        this.resetFocus = true;
    };

    BaseController.prototype.getItem = function (id) {
        var _this = this;
        "use strict";
        this.resetFocus = false;
        this.isModelLoaded = false;
        this.showEditable = false;
        this.isReadonly = true;
        this.context.resourceService.getItem({ resourceName: this.context.resourceName, id: id }).then(function (result) {
            return _this.onGetItemSuccess(result);
        }).catch(function (result) {
            return _this.onGetItemError(result);
        });
    };

    BaseController.prototype.onGetItemSuccess = function (result) {
        "use strict";
        this.viewModel = result;
        this.resetFocus = true;
        this.isModelLoaded = true;
        this.showEditable = true;
        this.isReadonly = false;
        if (result.metadata != undefined) {
            this.refreshMetadata(result.metadata);
        }
    };

    BaseController.prototype.refreshMetadata = function (metadata) {
        "use strict";
        if (metadata != undefined) {
            this.metadata = {};
            _.merge(this.metadata, this.metadataBase, metadata);
        }
    };

    BaseController.prototype.onGetItemError = function (result) {
        "use strict";
        this.messages = 'Error';
    };

    BaseController.prototype.updateItem = function (item) {
        var _this = this;
        "use strict";
        this.isModelLoaded = false;
        this.context.resourceService.updateItem({ resourceName: this.context.resourceName }, item).then(function (result) {
            return _this.onUpdateItemSuccess(result);
        }).catch(function (result) {
            return _this.onUpdateItemError(result);
        });
    };

    BaseController.prototype.onUpdateItemSuccess = function (result) {
        "use strict";
        this.messages = 'Success';
        this.isModelLoaded = false;
        if (result.metadata != undefined) {
            this.refreshMetadata(result.metadata);
        }
        var newPath = this.context.resourceName + "/" + result.id;
        this.context.$location.path(newPath);
    };

    BaseController.prototype.onUpdateItemError = function (result) {
        "use strict";
        this.messages = 'Error';
    };

    BaseController.prototype.deleteItem = function (item) {
        var _this = this;
        "use strict";
        this.isModelLoaded = false;
        this.context.resourceService.deleteItem({ resourceName: this.context.resourceName }, item).then(function (result) {
            return _this.onDeleteItemSuccess(result);
        }).catch(function (result) {
            return _this.onDeleteItemError(result);
        });
    };

    BaseController.prototype.onDeleteItemSuccess = function (result) {
        "use strict";
        this.messages = 'Success';
        this.isModelLoaded = false;
        if (result.metadata != undefined) {
            this.refreshMetadata(result.metadata);
        }
        this.getList();
    };

    BaseController.prototype.onDeleteItemError = function (result) {
        "use strict";
        this.messages = 'Error';
    };

    BaseController.prototype.doSubmit = function (isValid) {
        "use strict";
    };

    BaseController.prototype.validateForm = function (thisForm) {
        "use strict";
        var haveError = false;
        if (thisForm && thisForm.$error && thisForm.$error.required) {
            for (var i = 0, len = thisForm.$error.required.length; i < len; i++) {
                var requiredItem = thisForm.$error.required[i];
                if (requiredItem.$invalid) {
                    haveError = true;
                    thisForm.$setError(requiredItem.$name, 'Required');
                }
            }
        }
        return thisForm.$invalid ? 'error' : null;
    };
    return BaseController;
})();
///<reference path='references.ts' />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
* Created by Bob on 5/6/2014.
*/
//import BaseController = require('./base-controller');
var BaseDetailController = (function (_super) {
    __extends(BaseDetailController, _super);
    function BaseDetailController(context) {
        "use strict";
        _super.call(this, context);
        this.getItem(context.$routeParams.id);
    }
    BaseDetailController.prototype.doSubmit = function (isValid) {
        "use strict";
        this.updateItem(this.viewModel);
    };
    return BaseDetailController;
})(BaseController);
///<reference path='references.ts' />
/**
* Created by Bob on 5/6/2014.
*/
//import BaseController = require('./base-controller');
var BaseEditController = (function (_super) {
    __extends(BaseEditController, _super);
    function BaseEditController() {
        _super.apply(this, arguments);
    }
    BaseEditController.prototype.getData = function () {
        "use strict";
        this.getItem(this.context.$routeParams.id);
    };

    BaseEditController.prototype.doSubmit = function (isValid) {
        "use strict";
        this.updateItem(this.viewModel);
    };
    return BaseEditController;
})(BaseController);
///<reference path='references.ts' />
/**
* Created by Bob on 5/6/2014.
*/
//import BaseController = require('base-controller');
var BaseListController = (function (_super) {
    __extends(BaseListController, _super);
    function BaseListController() {
        _super.apply(this, arguments);
    }
    BaseListController.prototype.getData = function () {
        "use strict";
        this.getList();
    };
    return BaseListController;
})(BaseController);
///<reference path='references.ts' />
/**
* Created by Bob on 5/6/2014.
*/
//import BaseController = require('./base-controller');
var BaseNewController = (function (_super) {
    __extends(BaseNewController, _super);
    function BaseNewController() {
        _super.apply(this, arguments);
    }
    BaseNewController.prototype.init = function () {
        "use strict";
        this.showEditable = true;
        this.isReadonly = false;
        _super.prototype.init.call(this);
    };

    BaseNewController.prototype.doSubmit = function (isValid) {
        "use strict";
        this.createItem(this.viewModel);
    };
    return BaseNewController;
})(BaseController);
///<reference path='references.ts' />
/**
* Created by Bob on 5/6/2014.
*/
//import BaseController = require('./base-controller');
var BaseShowController = (function (_super) {
    __extends(BaseShowController, _super);
    function BaseShowController() {
        _super.apply(this, arguments);
    }
    BaseShowController.prototype.getData = function () {
        "use strict";
        this.getItem(this.context.$routeParams.id);
    };

    BaseShowController.prototype.doSubmit = function (isValid) {
        "use strict";
        this.updateItem(this.viewModel);
    };
    return BaseShowController;
})(BaseController);
///<reference path='references.ts' />
/**
* Created by Bob on 5/13/2014.
*/
var NavigationController = (function () {
    function NavigationController($location) {
        this.$location = $location;
    }
    NavigationController.prototype.isActive = function (viewLocation) {
        return viewLocation === this.$location.path();
    };
    return NavigationController;
})();

angular.module('angularCrud').controller('NavigationController', ['$location', function ($location) {
        return new NavigationController($location);
    }]);
///<reference path='base-controller.ts' />
///<reference path='base-detail-controller.ts' />
///<reference path='base-edit-controller.ts' />
///<reference path='base-list-controller.ts' />
///<reference path='base-new-controller.ts' />
///<reference path='base-show-controller.ts' />
///<reference path='navigation-controller.ts' />
///<reference path='module.ts' />
///<reference path='filters/index.ts' />
///<reference path='directives/index.ts' />
///<reference path='services/index.ts' />
///<reference path='controllers/index.ts' />
//# sourceMappingURL=angular-crud.js.map
