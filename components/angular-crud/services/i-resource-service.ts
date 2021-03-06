/**
 * Created by Bob on 7/8/2014.
 */
interface IResourceService{

    name: string;
    type: string;
    resource: any;
    items: any[];
    currentItem: any;
    currentItemIndex: number;
    searchModel: any;
    getListTime: any;
    metadata: any[];
    searchFilter: string;

    getList(params:any):ng.IPromise<any>;
    createItem(params:any, item:any):ng.IPromise<any>;
    getItem(params:any):ng.IPromise<any>;
    updateItem(params:any, item:any):ng.IPromise<any>;
    deleteItem(params:any, item:any):ng.IPromise<any> ;
}
