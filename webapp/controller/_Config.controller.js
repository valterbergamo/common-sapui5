sap.ui.define([
    "./_BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("xcop.fsc.service.controller._Config", {

        onInit: function () {
            //debugger
            let that = this;
            let oView = this.getView();

            let sServiceUrl = this.getOwnerComponent().getManifestEntry('/sap.app/dataSources/mainService/uri')
            let oModelOptions = ''

            let oModel = new sap.ui.model.odata.v2.ODataModel(
                sServiceUrl,
                oModelOptions
            )

            let sToken = oModel.getSecurityToken()

            let oSmartForm = oView.byId("smartForm");
            let sNamespace = this.getOwnerComponent().getManifestEntry("/sap.app/id");

            oSmartForm.bindElement("/configSet(Namespace='" + sNamespace + "',Token='" + sToken + "')");

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


        },
        onSaveConfig: function () {

        },
        onCancelConfig: function () {

        },
        onSaveConfig: function (oEvent) {
            //debugger

            oEvent = jQuery.extend(true, {}, oEvent);

            let that = this;
            let oView = this.getView();
            let oModel = oView.getModel();
            let oSmartForm = oView.byId("smartForm");

            var sTargetPos = "center center";
            sTargetPos = (sTargetPos === "default") ? undefined : sTargetPos;

            if (oModel.hasPendingChanges()) {
                oModel.submitChanges({
                    success: function (oData, resposta) {
                       //debugger
                        oModel.refresh(true);
                        let mensagem = JSON.parse(resposta.data.__batchResponses[0].__changeResponses[0].headers['sap-message'])

                        if (mensagem.severity == 'success') {
                            that.showMessage('S', mensagem.message)
                        } else {
                            that.showMessage('E', mensagem.message)
                        }

                        oSmartForm.setEditable(false);

                    },
                    error: function (erro) {
                        //debugger

                        sap.m.MessageToast.show("Erro update", {
                            onClose: fnResolve,
                            duration: 2000 || 2000,
                            at: sTargetPos,
                            my: sTargetPos
                        });
                    }
                });
            } else {
                sap.m.MessageToast.show("Não houve alteração!", {
                    duration: 2000 || 2000,
                    at: sTargetPos,
                    my: sTargetPos
                });
            }
        },
    });
});
