sap.ui.define(
  [
    './_BaseController',
    'sap/ui/model/json/JSONModel',
    '../model/formatter',
    'sap/ui/core/Fragment',
    'sap/m/MessageBox',
    'sap/m/library'
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Fragment,
    MessageBox,
    mLibrary
  ) {
    'use strict'

    let StandardListItem = mLibrary.StandardListItem
    let gBname = ''
    let gLifnr = ''
    let gContext = ''
    let gItemsDel = []
    let gItemsAdd = []

    return BaseController.extend('xcop.fsc.service.controller._Users', {
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

        this.getRouter()
          .getRoute('users')
          .attachPatternMatched(this._onObjectMatched, this)
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
      onCreateUsers: function () {
        //debugger
        let that = this
        let oView = this.getView()

        if (!this.byId('openDialogUser')) {
          Fragment.load({
            id: oView.getId(),
            name: 'xcop.fsc.service.view.fragments.fmCreateUser',
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog)
            oDialog.open()
          })
        } else {
          this.byId('openDialogUser').open()
        }
      },
      onCreateEntryUsers: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()

        let sBname = oView.byId('Bname').getValue()
        let sSmtpAddr = oView.byId('SmtpAddr').getValue()
        let sTelNumber = oView.byId('TelNumber').getValue()
        let sActive = oView.byId('Active').getSelected()

        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        oModel.createEntry('/usersSet', {
          properties: {
            Namespace: sNamespace,
            Bname: sBname,
            SmtpAddr: sSmtpAddr,
            TelNumber: sTelNumber,
            Active: sActive
          }
        })

        this.onSaveUsers()
      },

      onSaveUsers: function () {
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
      onDeleteUsers: function () {
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

        if (this.byId('openDialogUser')) {
          this.byId('openDialogUser').close()
          this.byId('openDialogUser').destroy()
        }

        if (this.byId('openDialogLinkUser')) {
          this.byId('openDialogLinkUser').close()
          this.byId('openDialogLinkUser').destroy()
        }
      },
      onSelectUserDetail: function (oEvent) {
       //debugger
        let that = this
        let oView = this.getView()
        let oSource = oEvent.getSource()
        let oModel = oView.getModel()

        gContext = oSource.getBindingContext().sPath

        gItemsAdd = []
        gItemsDel = []
        gBname = oSource.getBindingContext().getProperty('Bname')

        if (!this.byId('openDialogLinkUser')) {
          Fragment.load({
            id: oView.getId(),
            name: 'xcop.fsc.service.view.fragments.fmLinkUSerTo',
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog)
            oDialog.open()
          })
        } else {
          this.byId('openDialogLinkUser').open()
        }

        let oButtonAdd = oView.byId('ButtonAddGrouping')
        oButtonAdd.data('FieldGrouping', 'Authorid:GroupidPF:Lifnr:GroupidPR')

        let oList = oView.byId('ListLinkToUser')

        //debugger
        this.getLinkUserTo(gContext, 'profiles', oList)

      },
      getLinkUserTo: function (vContext, vNavTo, oList) {
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

            if (oFields) {
              oFields.forEach(function (profile) {
                let oItem = new sap.m.StandardListItem()
                oItem.setTitle(profile.Authorid)
                oItem.setDescription(profile.Authortitle)
                oList.addItem(oItem)
              })
              
            } else {
              oFields = oData.partners.results

              if (!oFields) {
                oFields = oData.groupsPartners.results

                if (oFields) {
                  oFields.forEach(function (partner) {
                    let oItem = new sap.m.StandardListItem()
                    oItem.setTitle(partner.Groupid)
                    oItem.setDescription(partner.Grouptitle)
                    oList.addItem(oItem)
                  })
                }
                
              } else {
                oFields.forEach(function (partner) {
                  let oItem = new sap.m.StandardListItem()
                  oItem.setTitle(partner.Lifnr)
                  oItem.setDescription(partner.Name1)
                  oList.addItem(oItem)
                })
              }

              
            }

            

            
          },
          error: function (oError) { }
        })
      },
      onAddLinkToUser: async function (oEvent) {
        //debugger
        let oView = this.getView()
        let oSource = oEvent.getSource()
        let oInput = oView.byId(oSource.sId)
        let oLabel = oView.byId(oSource.sId + 'Label')

        let oList = oView.byId('ListLinkToUser')

        let sSourceName = oSource.sId.split('--').pop()

        if (sSourceName == 'ButtonAddGrouping') {
          
          let sSelectedIconTab = oView.byId('idIconTabBarMulti').getSelectedKey()

          switch (sSelectedIconTab) {
            case 'profiles':
              oInput = oView.byId('Authorid')
              oLabel = oView.byId('AuthoridLabel')
              break
            case 'groupsProfiles':
              oInput = oView.byId('GroupidPF')
              oLabel = oView.byId('GroupidPFLabel')
              break
            case 'partners':
              oInput = oView.byId('Lifnr')
              oLabel = oView.byId('LifnrLabel')
              break
            case 'groupsPartners':
              oInput = oView.byId('GroupidPR')
              oLabel = oView.byId('GroupidPRLabel')
              break
            }

          sSourceName = oInput.sId.split("--").pop()
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
            oItem.data("SourceName", sSourceName)
            //debugger
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
      
      onSaveLinkToUser: function () {
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
        let sLifnr = ''
        let sGroupid = ''
        let sSourceName = oView.byId('idIconTabBarMulti').getSelectedKey()
        
        gItemsAdd.forEach(function (oItem) {
          //debugger
          switch (sSourceName) {
            case 'profiles':
              sAuthorid = oItem.mProperties.title
              oModel.createEntry('/profilesSet', {
                properties: {
                  Namespace: sNamespace,
                  Authorid: sAuthorid,
                  Bname: gBname,
                  Active: true
                }
              })
              break
            case 'groupsProfiles':
              sAuthorid = oItem.mProperties.title
              oModel.createEntry('/profilesSet', {
                properties: {
                  Namespace: sNamespace,
                  Authorid: sAuthorid,
                  Bname: gBname,
                  Active: true
                }
              })
              break
            case 'partners':
              sLifnr = oItem.mProperties.title
              oModel.createEntry('/usersGroupingSet', {
                properties: {
                  Namespace: sNamespace,
                  Groupid: '',
                  Bname: gBname,
                  Lifnr: sLifnr,
                  Active: true
                }
              })
              break
            case 'groupsPartners':
              sGroupid = oItem.mProperties.title
              oModel.createEntry('/usersGroupingSet', {
                properties: {
                  Namespace: sNamespace,
                  Groupid: sGroupid,
                  Bname: gBname,
                  Lifnr: '',
                  Active: true
                }
              })
              break

          }
        
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
      onDeselectAllList: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListLinkToUser')
        oList.removeSelections()
      },
      onSelectAllList: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListLinkToUser')
        oList.selectAll()
      },
      onDelLinkToUser: function () {
        //debugger
        let that = this
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListLinkToUser')

        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        let sSourceName = oView.byId('idIconTabBarMulti').getSelectedKey()
        
        let sAuthorid = ''
        let sLifnr = ''
        let sGroupid = ''

        oList.getSelectedItems().forEach(function (item) {
          oList.removeItem(item.sId)

          let oPath = ''

          switch (sSourceName) {
            case 'profiles':
              sAuthorid = item.mProperties.title  
              oPath = "/profilesSet(Bname='" + gBname + "',Namespace='" + sNamespace + "',Authorid='" + sAuthorid + "',Lifnr='')"  
              break
            case 'groupsProfiles':
              sAuthorid = item.mProperties.title  
              oPath = "/profilesSet(Bname='" + gBname + "',Namespace='" + sNamespace + "',Authorid='" + sAuthorid + "',Lifnr='')"  
              break
            case 'partners':
              sLifnr = item.mProperties.title  
              oPath = "/usersGroupingSet(Namespace='" + sNamespace + "',Lifnr='" + sLifnr + "',Bname='" + gBname + "',Groupid='" + sGroupid + "')"
              break
            case 'groupsPartners':
              sGroupid = item.mProperties.title  
              oPath = "/usersGroupingSet(Namespace='" + sNamespace + "',Lifnr='" + sLifnr + "',Bname='" + gBname + "',Groupid='" + sGroupid + "')"
              break
          }
          gItemsDel.push(oPath)
        })
      },
      onIconTabBarSelect: function (oEvent) {
        //debugger
        let oView = this.getView()
        let oList = oView.byId('ListLinkToUser')

        switch (oEvent.getSource().getSelectedKey()) {
          case 'profiles':
            this.getLinkUserTo(gContext, 'profiles', oList)
            break
          case 'groupsProfiles':
            this.getLinkUserTo(gContext, 'groupsProfiles', oList)
            break
          case 'partners':
            this.getLinkUserTo(gContext, 'partners', oList)
            break
          case 'groupsPartners':
            this.getLinkUserTo(gContext, 'groupsPartners', oList)
            break
        }

        oEvent.getSource().getSelectedKey()
      }
    })
  }
)
