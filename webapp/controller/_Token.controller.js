sap.ui.define([
    "./_BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("xcop.fsc.service.controller._Token", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the home controller is instantiated.
         * @public
         */
        onInit: function () {
            let oOwnerComponent = this.getOwnerComponent();
            let oRouter = oOwnerComponent.getRouter();
            oRouter = oOwnerComponent.getRouter()
    
            this.getRouter().getRoute('token').attachPatternMatched(this._onObjectMatched, this)
        },
        _onObjectMatched: function (oEvent) {
            this.checkViewPermission()
        },

        onBeforeRendering: function () {
            //debugger
            let oView = this.getView();
            let oModel = oView.getModel();
            this.setModelHeader(oModel);
            this.screenControl()
        },
        
        onAfterRendering: function () {
            //debugger
        
        }
        

    });
});
