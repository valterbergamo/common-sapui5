sap.ui.define([
    "./_BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("xcop.fsc.service.controller._NotFound", {

        /**
         * Navigates to the home when the link is pressed
         * @public
         */
        onLinkPressed : function () {
            this.getRouter().navTo("home");
        }

    });

});