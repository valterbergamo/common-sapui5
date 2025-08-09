sap.ui.define(['./_BaseController'], function (BaseController) {
  'use strict'

  return BaseController.extend('xcop.fsc.service.controller.App', {
    onInit: async function () {
      // apply content density mode to root view
      let oView = this.getView()

      this.getView().addStyleClass(
        this.getOwnerComponent().getContentDensityClass()
      )
    },

    onBeforeRendering: async function () {
      //debugger
      let oView = this.getView()
      let oModel = oView.getModel()
      this.setModelHeader(oModel);

      await this.onToken()
      await this.onMenu('App', 'menu')

      /*
       * ===========================================================================================
       *   Busca dados de dominio para campos <Select>
       */

      await this.onGetDomainValues('/XCOP/FSC_MENUTYPE', '')
      await this.onGetDomainValues('/XCOP/FSC_STATUS','/XCOP/TFSC_STAT:Status.StatusTitle')
      await this.onGetDomainValues('/XCOP/FSC_GPTYPE', '')

      /**
       * ===========================================================================================
       */

      //this.screenControl()
    },
    /**
     * @override
     */
    onAfterRendering: function () {
      //debugger
      this.onCollapseExpandPress()
    }
  })
})
