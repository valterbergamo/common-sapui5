sap.ui.define(
  [
    './_BaseController',
    'sap/ui/model/json/JSONModel',
    '../model/formatter',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
  ],
  function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    'use strict'

    return BaseController.extend('xcop.fsc.service.controller.Examples', {
      onInit: function () {
        //debugger

        let oOwnerComponent = this.getOwnerComponent();
        let oRouter = oOwnerComponent.getRouter();
        oRouter = oOwnerComponent.getRouter()

        this.getRouter().getRoute('examples').attachPatternMatched(this._onObjectMatched, this)
        
        
      },
      onBeforeRendering: function () {
        //debugger
        //this.screenControl()
      },
      /**
       * @override
       */
      onAfterRendering: function () {
        //debugger
      },
      _onObjectMatched: function (oEvent) {
        //this.checkViewPermission()
      }
    })
  }
)
