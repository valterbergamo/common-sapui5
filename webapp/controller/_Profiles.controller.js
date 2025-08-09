sap.ui.define(
  [
    './_BaseController',
    'sap/ui/model/json/JSONModel',
    '../model/formatter',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/core/Fragment',
    'sap/m/MessageBox',
    'sap/m/library'
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    Fragment,
    MessageBox,
    mLibrary
  ) {
    'use strict'

    let StandardListItem = mLibrary.StandardListItem
    let gAuthorid = ''
    let gItemsDel = []
    let gItemsAdd = []

    return BaseController.extend('xcop.fsc.service.controller._Profiles', {
      
      onInit: function () {
        let oOwnerComponent = this.getOwnerComponent()
        let oRouter = oOwnerComponent.getRouter()
        oRouter = oOwnerComponent.getRouter()

        this.getRouter().getRoute('profiles').attachPatternMatched(this._onObjectMatched, this)
      },
      _onObjectMatched: function (oEvent) {
        this.checkViewPermission()
      },
      onBeforeRendering: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()

        //this.onGetDomainValues('/XCOP/FSC_STATUS','/XCOP/TFSC_STAT:Status.StatusTitle')
        this.setModelHeader(oModel)
        this.screenControl()
      },

      onAfterRendering: function () {
        //debugger
      },

      onCreateProfile: function () {
        //debugger
        let that = this
        let oView = this.getView()

        if (!this.byId('openDialogProfile')) {
          Fragment.load({
            id: oView.getId(),
            name: 'xcop.fsc.service.view.fragments.fmCreateProfile',
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog)
            oDialog.open()
          })
        } else {
          this.byId('openDialogProfile').open()
        }
      },
      onCreateEntryProfile: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let sAuthorid = oView.byId('Authorid').getValue()
        let sAuthortitle = oView.byId('Authortitle').getValue()
        let sDescription = oView.byId('Description').getValue()
        let sActive = oView.byId('Active').getSelected()

        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        oModel.createEntry('/profilesSet', {
          properties: {
            Namespace: sNamespace,
            Authorid: sAuthorid,
            Authortitle: sAuthortitle,
            Description: sDescription,
            Active: sActive
          }
        })

        this.onSaveProfile()
      },

      onSaveProfile: function () {
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
      onDeleteProfiles: function () {
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

                oModel.remove(oPath, {
                  success: function (oData, oResponse) {
                    //debugger
                    let mensagem = JSON.parse(oResponse.headers['sap-message'])

                    switch (mensagem.severity) {
                      case 'success':
                        that.showMessage('S', mensagem.message) 
                        break
                      case 'error':
                        that.showMessage('E', mensagem.message) 
                        break
                      case 'warning':
                        that.showMessage('W', mensagem.message) 
                        break
                    }
                  },
                  error: function (oError) { }
                })
              }

              that.getView().getModel().refresh(true)
            }
          }
        })
      },
      _onCancelDialog: function () {
        //debugger

        if (this.byId('openDialogProfile')) {
          this.byId('openDialogProfile').close()
          this.byId('openDialogProfile').destroy()
        }

        if (this.byId('openDialogLinkProfile')) {
          this.byId('openDialogLinkProfile').close()
          this.byId('openDialogLinkProfile').destroy()
        }
      },

      onSelectProfile: function (oEvent) {
        //debugger
        let that = this
        let oView = this.getView()
        let oSource = oEvent.getSource()
        let oModel = oView.getModel()

        let vContext = oSource.getBindingContext().sPath

        gItemsAdd = []
        gItemsDel = []
        gAuthorid = oSource.getBindingContext().getProperty('Authorid')

        if (!this.byId('openDialogLinkProfile')) {
          Fragment.load({
            id: oView.getId(),
            name: 'xcop.fsc.service.view.fragments.fmLinkProfileTo',
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog)
            oDialog.open()
          })
        } else {
          this.byId('openDialogLinkProfile').open()
        }

        let oButtonAdd = oView.byId('ButtonAddGrouping')
        oButtonAdd.data('FieldGrouping', 'FieldName')

        //debugger
        let oToolBar = oView.byId('OverflowToolbarProfile')
        let oInputField = oView.byId('FieldName')
        let oButtonSave = oView.byId('btSaveProfile')

        if (gAuthorid == 'ADMIN') {
          // oToolBar.setVisible(false)
          // oInputField.setVisible(false)
          // oButtonSave.setVisible(false)
        } else {
          oToolBar.setVisible(true)
          oInputField.setVisible(true)
          oButtonSave.setVisible(true)
        }

        oModel.read(vContext, {
          urlParameters: {
            $expand: 'fields'
          },
          success: function (oData, oResponse) {
            //debugger
            let oList = oView.byId('ListFields')
            oList.removeAllItems()
            let oFields = oData.fields.results

            oFields.forEach(function (field) {
              let oItem = new sap.m.StandardListItem()
              oItem.setTitle(field.Fieldname)
              oItem.setDescription(field.Viewname)
              oItem.data("Inputtype", field.Inputtype)
              oList.addItem(oItem)
            })
          },
          error: function (oError) { }
        })
      },
      onAddFieldsProfile: async function (oEvent) {
        //debugger

        let oView = this.getView()
        let oModel = oView.getModel()
        let oSource = oEvent.getSource()
        let oInput = oView.byId(oSource.sId)
        let oLabel = oView.byId(oSource.sId + 'Label')
        let oList = oView.byId('ListFields')


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

        // let oButton = oView.byId('ButtonAddGrouping')
        // let sField = oButton.data('FieldGrouping')

        // if (sField) {
        //   oInput = oView.byId(sField)
        //   oLabel = oView.byId(sField + 'Label')
        // }

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
      onSaveFieldsProfile: function () {
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

        let sViewName = ''
        let sFieldName = ''
        let sInputtype = ''

        gItemsAdd.forEach(function (oItem) {
          sFieldName = oItem.mProperties.title
          sViewName = oItem.mProperties.description

          oModel.createEntry('/screenControlTableSet', {
            properties: {
              Namespace: sNamespace,
              Viewname: sViewName,
              Fieldname: sFieldName,
              Authorid: gAuthorid
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
      onDelFieldsProfile: function () {
        //debugger
        let that = this
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListFields')

        let sViewName = ''
        let sField = ''
        let sInputtype = ''
        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        oList.getSelectedItems().forEach(function (item) {
          oList.removeItem(item.sId)

          sField = item.mProperties.title
          sViewName = item.mProperties.description
          sInputtype = item.data("Inputtype")

          sField = sField.replace(":", "%3A")
          sField = sField.replace("#", "%23")

          let oPath = "/screenControlTableSet(Authorid='" + gAuthorid + "',Lifnr='',Bname='',Namespace='" + sNamespace + "',Viewname='" + sViewName + "',Fieldname='" + sField + "')"

          gItemsDel.push(oPath)
        })
      },
      onDeselectAllList: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListFields')
        oList.removeSelections()
      },
      onSelectAllList: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListFields')
        oList.selectAll()
      }
    })
  }
)
