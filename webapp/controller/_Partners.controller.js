sap.ui.define(
  [
    './_BaseController',
    'sap/ui/model/json/JSONModel',
    '../model/formatter',
    'sap/ui/core/Fragment',
    'sap/m/MessageBox',
    'sap/m/library'
  ],
  function (BaseController, JSONModel, formatter, Fragment, MessageBox, mLibrary) {
    'use strict'

    let StandardListItem = mLibrary.StandardListItem
    let gContext = ''
    let gLifnr = ''
    let gItemsDel = []
    let gItemsAdd = []

    return BaseController.extend('xcop.fsc.service.controller._Partners', {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the home controller is instantiated.
       * @public
       */
      onInit: function () {
        let oOwnerComponent = this.getOwnerComponent()
        let oRouter = oOwnerComponent.getRouter()
        oRouter = oOwnerComponent.getRouter()

        this.getRouter().getRoute('partners').attachPatternMatched(this._onObjectMatched, this)
      },
      _onObjectMatched: function (oEvent) {
        this.checkViewPermission()
      },
      onBeforeRendering: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        this.setModelHeader(oModel)
        this.screenControl()
      },

      onAfterRendering: function () {
        //debugger
      },
      onCreatePartners: function () {
        //debugger
        let that = this
        let oView = this.getView()

        //this.onGetDomainValues('DTAMS')

        if (!this.byId('openDialogPartner')) {
          Fragment.load({
            id: oView.getId(),
            name: 'xcop.fsc.service.view.fragments.fmCreatePartner',
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog)
            oDialog.open()
          })
        } else {
          this.byId('openDialogPartner').open()
        }
      },
      onCreateEntryPartners: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let sLifnr = oView.byId('Lifnr').getValue()
        let sName1 = oView.byId('Name1').getValue()
        let sActive = oView.byId('Active').getSelected()

        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        oModel.createEntry('/usersPartnersSet', {
          properties: {
            Namespace: sNamespace,
            Lifnr: sLifnr,
            Name1: sName1,
            Active: sActive
          }
        })

        this.onSavePartners()
      },

      onSavePartners: function () {
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
                that._onCancelDialog()
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
      onDeletePartners: function () {
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
      _onCancelDialog: function () {
        //debugger

        if (this.byId('openDialogPartner')) {
          this.byId('openDialogPartner').close()
          this.byId('openDialogPartner').destroy()
        }

        if (this.byId('openDialogLinkPartner')) {
          this.byId('openDialogLinkPartner').close()
          this.byId('openDialogLinkPartner').destroy()
        }
      },

      onSelectPartnerDetail: function (oEvent) {
        //debugger
        let that = this
        let oView = this.getView()
        let oSource = oEvent.getSource()
        let oModel = oView.getModel()

        gContext = oSource.getBindingContext().sPath

        gItemsAdd = []
        gItemsDel = []
        gLifnr = oSource.getBindingContext().getProperty('Lifnr')

        if (!this.byId('openDialogLinkPartner')) {
          Fragment.load({
            id: oView.getId(),
            name: 'xcop.fsc.service.view.fragments.fmLinkPartnerTo',
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog)
            oDialog.open()
          })
        } else {
          this.byId('openDialogLinkPartner').open()
        }

        let oButtonAdd = oView.byId('ButtonAddGrouping')
        oButtonAdd.data('FieldGrouping', 'Authorid:Groupid')
        let oList = oView.byId('ListProfiles')

        this.getLinkPartnerTo(gContext, 'profiles', oList)

      },

      getLinkPartnerTo: function (vContext, vNavTo, oList) {
        //debugger

        let that = this
        let sNavTo = vNavTo
        let oView = this.getView()
        let oModel = oView.getModel()

        oModel.read(vContext, {
          urlParameters: {
            $expand: sNavTo
          },
          success: function (oData, oResponse) {
            //debugger
           
            oList.removeAllItems()
            let oFields = oData.profiles.results

            if (!oFields) {
              oFields = oData.groupsProfiles.results
            }

            oFields.forEach(function (profile) {
              let oItem = new sap.m.StandardListItem()
              oItem.setTitle(profile.Authorid)
              oItem.setDescription(profile.Authortitle)
              oList.addItem(oItem)
            })
          },
          error: function (oError) { }
        })
      },

      onIconTabBarSelect: function (oEvent) {
        //debugger
        let oView = this.getView()
        let oList = oView.byId('ListProfiles')

        switch (oEvent.getSource().getSelectedKey()) {
          case 'profiles':
            this.getLinkPartnerTo(gContext, 'profiles', oList)
            break
          case 'groupsProfiles':
            this.getLinkPartnerTo(gContext, 'groupsProfiles', oList)
            break
          case 'partners':
            this.getLinkPartnerTo(gContext, 'partners', oList)
            break
          case 'groupsPartners':
            this.getLinkPartnerTo(gContext, 'groupsPartners', oList)
            break
        }

        oEvent.getSource().getSelectedKey()
      },
      onAddProfilePartner: async function (oEvent) {
        //debugger
        let oView = this.getView()
        let oSource = oEvent.getSource()
        let oInput = oView.byId(oSource.sId)
        let oLabel = oView.byId(oSource.sId + 'Label')

        let oList = oView.byId('ListProfiles')

        let sSourceName = oSource.sId.split('--').pop()

        if (sSourceName == 'ButtonAddGrouping') {
          let aFields = oInput.data('FieldGrouping').split(":")
          
          try {
            aFields.forEach(function (field) {
              oInput = oView.byId(field)
              oLabel = oView.byId(field + 'Label')
              if (oInput.getValue() != '') {
                throw new Exception("End the loop");
              }
            })  
          } catch (error) {
            
          }
        }

        //debugger
        let sValid = await this.onCheckInput(oInput)

        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        if (sValid === true) {
          let sValue = oInput.getValue()
          let sName1 = oLabel.getText()
          let oItem = new StandardListItem()

          oList.getItems().forEach(function (item) {
            if (item.mProperties.title == sValue) {
              sValid = false
            }
          })

          if (sValid === true) {
            oItem.setTitle(sValue)
            oItem.setDescription(sName1)
            oList.addItem(oItem)

            oInput.setValue('')
            if (oLabel) {
              oLabel.setText('')
            }

            gItemsAdd.push(oItem)
          } else {
            this.showMessage('W', 'Campo ja está no perfil!')
          }
        } else {
          this.showMessage('E', 'Campo informato é invalido!')
        }
      },
      onDeselectAllList: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListProfiles')
        oList.removeSelections()
      },
      onSelectAllList: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListProfiles')
        oList.selectAll()
      },
      onDelProfilePartner: function () {
        //debugger
        let that = this
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListProfiles')

        let sAuthorid = ''

        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        oList.getSelectedItems().forEach(function (item) {
          oList.removeItem(item.sId)

          sAuthorid = item.mProperties.title

          let oPath =
            "/profilesSet(Lifnr='" + gLifnr + "',Namespace='" + sNamespace + "',Authorid='" + sAuthorid + "',Bname='')"

          gItemsDel.push(oPath)
        })
      },
      onSaveProfilesPartner: function () {
        //debugger
        let that = this
        let oView = this.getView()
        let oModel = oView.getModel()
        var sTargetPos = 'center center'

        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        gItemsDel.forEach(function (item) {
          oModel.remove(item)
        })

        gItemsDel = []

        let sAuthorid = ''

        gItemsAdd.forEach(function (oItem) {
          sAuthorid = oItem.mProperties.title

          oModel.createEntry('/profilesSet', {
            properties: {
              Namespace: sNamespace,
              Authorid: sAuthorid,
              Lifnr: gLifnr,
              Active: true
            }
          })
        })

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

              gItemsAdd = []

              if (mensagem.severity == 'success') {
                MessageBox.success(mensagem.message, {
                  actions: ['OK'],
                  onClose: function (sAction) {
                    if (sAction == 'OK') {
                      that._onCancelDialog()
                    }
                  }
                })
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
        } else {
          this.showMessage('S', 'Operação realizada')
          this._onCancelDialog()
        }
      },
    })
  }
)
