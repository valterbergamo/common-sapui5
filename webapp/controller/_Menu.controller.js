sap.ui.define(
  ['./_BaseController', 'sap/m/MessageBox', 'sap/ui/core/Fragment'],
  function (BaseController, MessageBox, Fragment) {
    'use strict'

    return BaseController.extend('xcop.fsc.service.controller._Menu', {
      onInit: function () {
        let oOwnerComponent = this.getOwnerComponent()
        let oRouter = oOwnerComponent.getRouter()
        oRouter = oOwnerComponent.getRouter()

        this.getRouter().getRoute('menu').attachPatternMatched(this._onObjectMatched, this)
      },
      _onObjectMatched: function (oEvent) {
        this.checkViewPermission()
      },
      onBeforeRendering: async function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()

        this.setModelHeader(oModel)
        this.screenControl()
      },

      onAfterRendering: function () {
        //debugger
      },
      /**
       * @override
       */
      onCreateEntryMenu: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()

        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        let sViewname = oView.byId('Viewname').getValue()
        let sMenutype = oView.byId('Menutype').getSelectedKey()
        let sMenukey = oView.byId('Menukey').getValue()
        let sMenuparentkey = oView.byId('Menuparentkey').getValue()
        let sTitlei18nkey = oView.byId('Titlei18nkey').getValue()
        let sNavto = oView.byId('Navto').getValue()
        let sIcon = oView.byId('Icon').getValue()
        let sOrdermenu = oView.byId('Ordermenu').getValue()
        let sActive = oView.byId('Active').getSelected()
        let sExpanded = oView.byId('Expanded').getSelected()

        oModel.createEntry('/menuTableSet', {
          properties: {
            Namespace: sNamespace,
            Viewname: sViewname,
            Menutype: sMenutype,
            Menukey: sMenukey,
            Menuparentkey: sMenuparentkey,
            Titlei18nkey: sTitlei18nkey,
            Navto: sNavto,
            Icon: sIcon,
            Ordermenu: sOrdermenu,
            Active: sActive,
            Expanded: sExpanded
          }
        })

        this.onSaveMenu()
      },

      onSaveMenu: function () {
        let that = this
        let oView = this.getView()
        let oModel = oView.getModel()
        var sTargetPos = 'center center'

        sTargetPos = sTargetPos === 'default' ? undefined : sTargetPos

        if (oModel.hasPendingChanges()) {
          oModel.submitChanges({
            success: function (oData, resposta) {
              //debugger
              oModel.refresh(true)
              let mensagem = JSON.parse(
                resposta.data.__batchResponses[0].__changeResponses[0].headers[
                  'sap-message'
                ]
              )

              if (mensagem.severity == 'success') {
                that._onCancelDialogMenu()
              } else {
                MessageBox.warning(mensagem.message, {
                  actions: ['OK'],
                  onClose: function (sAction) {
                    if (sAction == 'OK') {
                      //Incluir alguma lógica caso queira
                    }
                  }
                })
              }
            },
            error: function (erro) {
              //debugger
              sap.m.MessageToast.show('Erro update', {
                onClose: fnResolve,
                duration: 2000 || 2000,
                at: sTargetPos,
                my: sTargetPos
              })
            }
          })
        }
      },
      /**
       * @override
       */
      onAfterRendering: function () { },
      /**
       * @override
       */

      onCreateMenu: function () {
        let oView = this.getView()
        let that = this
        //debugger

        let teste = oView.getModel('teste')
        // this.onGetDomainValues('/XCOP/FSC_MENUTYPE');

        if (!this.byId('openDialogMenu')) {
          Fragment.load({
            id: oView.getId(),
            name: 'xcop.fsc.service.view.fragments.fmCreateMenu',
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog)
            oDialog.open()
          })
        } else {
          this.byId('openDialogMenu').open()
        }
      },

      onDeleteMenu: function () {
        //debugger
        let that = this
        let oModel = this.getView().getModel()
        let oTable = this.getView().byId('tableAux')
        let aContexts = oTable.getSelectedContexts()

        MessageBox.warning('Excluir itens selecionados?', {
          actions: ['Sim', 'Não'],
          onClose: function (sAction) {
            if (sAction == 'Sim') {
              for (var i = aContexts.length - 1; i >= 0; i--) {
                var oPath = aContexts[i].sPath
                oModel.remove(oPath)
              }

              that.getView().getModel().refresh(true)
            }
          }
        })
      },
      _onCancelDialogMenu: function () {
        //debugger

        if (this.byId('openDialogMenu')) {
          this.byId('openDialogMenu').close()
          this.byId('openDialogMenu').destroy()
        }
      }
    })
  }
)
