sap.ui.define([
  "./_BaseController",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment",
  "sap/ui/comp/smartmultiedit/Field"
], function (
  BaseController,
  MessageBox,
  Fragment,
  Field
) {
  "use strict";

  return BaseController.extend("xcop.fsc.service.controller._ScreenControl", {

    onInit: function () {
      let oOwnerComponent = this.getOwnerComponent()
      let oRouter = oOwnerComponent.getRouter()
      oRouter = oOwnerComponent.getRouter()

      this.getRouter().getRoute('screenControl').attachPatternMatched(this._onObjectMatched, this)
    },
    _onObjectMatched: function (oEvent) {
      this.checkViewPermission()
    },

    onBeforeRendering: function () {
      //debugger
      let oView = this.getView();
      let oModel = oView.getModel();
      this.setModelHeader(oModel);
      this.onCreateScreen()
      this.screenControl()
    },
    onAfterRendering: function () {
      //debugger
    }


  });
});