sap.ui.define(['./_BaseController'], function (BaseController) {
  'use strict'

  return BaseController.extend('xcop.fsc.service.controller._Rating', {
    onInit: function () {
      let oOwnerComponent = this.getOwnerComponent()
      let oRouter = oOwnerComponent.getRouter()
      oRouter = oOwnerComponent.getRouter()

      this.getRouter().getRoute('rating').attachPatternMatched(this._onObjectMatched, this)
    },
    _onObjectMatched: function (oEvent) {
      //this.checkViewPermission()
    },
    onBeforeRendering: function () {
      //debugger
      let oView = this.getView()
      let oModel = oView.getModel()
      this.setModelHeader(oModel)
      //this.screenControl()
    },

    onAfterRendering: function () {
      //debugger
    }
  })
})
