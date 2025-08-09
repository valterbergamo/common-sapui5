sap.ui.define([
	"./_BaseController"

], function(
	BaseController
) {
	"use strict";

	return BaseController.extend("xcop.fsc.service.controller.Help", {

		onInit : function () {
          

        },
        onBeforeRendering: function() {
            //debugger
            let oView = this.getView();
            let oModel = oView.getModel();
            this.setModelHeader(oModel);
            this.screenControl()
        },
        
        onAfterRendering: function() {
            //debugger
        
        }

	});
});