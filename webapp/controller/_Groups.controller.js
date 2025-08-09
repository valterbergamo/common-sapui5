sap.ui.define(
  [
    './_BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Fragment',
    'sap/m/MessageBox',
    'sap/m/library'
  ],
  function (BaseController, JSONModel, Fragment, MessageBox, mLibrary) {
    'use strict'

    let StandardListItem = mLibrary.StandardListItem
    let gGroupid = ''
    let gContext = ''
    let gItemsDel = []
    let gItemsAdd = []
    let Input = mLibrary.Input

    let field = {
      Fieldname: '',
      Precfield: '',
      Valuehelp: false,
      Valexi: false,
      Suggestion: false,
      Tablename: '',
      Lowercase: true,
      Decimals: '',
      Mask: '',
      Leng: '',
      Datatype: '',
      Suggestiontable: '',
      ScrtextM: '',
      Submit: '',
      Filter: ''
    }

    return BaseController.extend('xcop.fsc.service.controller._Groups', {
      onInit: function () { },
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
      onCreateGroups: function () {
        //debugger
        let that = this
        let oView = this.getView()

        let oSelect = oView.byId('Grouptype')

        if (!this.byId('openDialogGroup')) {
          Fragment.load({
            id: oView.getId(),
            name: 'xcop.fsc.service.view.fragments.fmCreateGroup',
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog)
            oDialog.open()
          })
        } else {
          this.byId('openDialogGroup').open()
        }
      },
      onCreateEntryGroups: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let sGroupid = oView.byId('Groupid').getValue()
        let sGrouptype = oView.byId('Grouptype').getSelectedKey()
        let sGroupTitle = oView.byId('GroupTitle').getValue()
        let sActive = oView.byId('Active').getSelected()

        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        oModel.createEntry('/groupsSet', {
          properties: {
            Namespace: sNamespace,
            Groupid: sGroupid,
            Grouptype: sGrouptype,
            GroupTitle: sGroupTitle,
            Active: sActive
          }
        })

        this.onSaveGroups()
      },

      onCreateEntryGrouping: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListGrouping')

        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        oModel.createEntry('/usersGroupingSet', {
          properties: {
            Namespace: sNamespace,
            Groupid: sGroupid,
            Lifnr: sLifnr,
            Bname: sBname
          }
        })

        this.onSaveGroups()
      },

      onSaveGroups: function () {
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
      onDeleteGroups: function () {
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

        if (this.byId('openDialogGroup')) {
          this.byId('openDialogGroup').close()
          this.byId('openDialogGroup').destroy()
        }

        if (this.byId('openDialogLinkGroup')) {
          this.byId('openDialogLinkGroup').close()
          this.byId('openDialogLinkGroup').destroy()
        }
      },
      onSelectGroupDetail: function (oEvent) {
        //debugger

        let that = this
        let oView = this.getView()
        let oSource = oEvent.getSource()
        let oModel = oView.getModel()
        
        gItemsAdd = []
        gItemsDel = []

        gContext = oSource.getBindingContext().sPath

        if (this.byId('openDialogLinkGroup')) {
          this.byId('openDialogLinkGroup').destroy()
        }

        if (!this.byId('openDialogLinkGroup')) {
          Fragment.load({
            id: oView.getId(),
            name: 'xcop.fsc.service.view.fragments.fmLinkGroupTo',
            controller: this
          }).then(function (oDialog) {
            oView.addDependent(oDialog)
            oDialog.open()
          })
        }

        gGroupid = oSource.getBindingContext().getProperty('Groupid')

        let sGrouptype = oSource.getBindingContext().getProperty('Grouptype')
        let oSimpleForm = oView.byId('simpleForm')
        let oButtonAdd = oView.byId('ButtonAddGrouping')
        let oIconTabFilterProfile = oView.byId('idIconTabFilterProfile')
        let oIconTabFilterGroupProfile = oView.byId('idIconTabFilterGroupProfile')

        oIconTabFilterProfile.setVisible(false)
        oIconTabFilterGroupProfile.setVisible(false)

        switch (sGrouptype) {
          case 'PR':
            field.Fieldname = 'Lifnr'
            field.Suggestiontable = '/XCOP/TFSC_Login:Lifnr.Name1'
            field.Valexi = true
            field.Suggestion = true
            field.Valuehelp = true
            field.Leng = '35'
            field.Datatype = 'CHAR'
            field.ScrtextM = 'Parceiro'
            field.Submit = 'onAddGrouping'
            field.Filter = "Active EQ 'X'"

            this.createInput(oView, that, field, oSimpleForm)
            oButtonAdd.data('FieldGrouping', field.Fieldname)

            break
          case 'PF':
            field.Fieldname = 'Authorid'
            field.Suggestiontable = '/XCOP/TFSC_AUTH:Authorid.Authortitle'
            field.Valexi = true
            field.Suggestion = true
            field.Valuehelp = true
            field.Leng = '35'
            field.Datatype = 'CHAR'
            field.ScrtextM = 'Perfil'
            field.Submit = 'onAddGrouping'
            field.Tablename = ''
            field.Filter = "Active EQ 'X' AND Lifnr EQ '' AND Bname EQ ''"

            this.createInput(oView, that, field, oSimpleForm)
            oButtonAdd.data('FieldGrouping', field.Fieldname)
            break
          case 'US':
            field.Fieldname = 'Bname'
            field.Suggestiontable = '/XCOP/TFSC_Users:Bname.Name1'
            field.Valexi = true
            field.Suggestion = true
            field.Valuehelp = true
            field.Leng = '35'
            field.Datatype = 'CHAR'
            field.ScrtextM = 'Usuário'
            field.Submit = 'onAddGrouping'
            field.Tablename = ''
            field.Filter = "Active EQ 'X'"

            this.createInput(oView, that, field, oSimpleForm)
            oButtonAdd.data('FieldGrouping', field.Fieldname + ':AuthoridGroup')
            oIconTabFilterProfile.setVisible(true)
            oIconTabFilterGroupProfile.setVisible(true)
            break
        }

        let oList = oView.byId('ListGrouping')
        this.getLinkGroupTo(gContext, 'grouping', oList)
      },
      onAddGrouping: async function (oEvent) {
        //debugger

        let oView = this.getView()
        let oModel = oView.getModel()
        let oSource = oEvent.getSource()
        let oInput = oView.byId(oSource.sId)
        let oLabel = oView.byId(oSource.sId + 'Label')
        let oList = oView.byId('ListGrouping')

        let oButton = oView.byId('ButtonAddGrouping')
        let sField = oButton.data('FieldGrouping')
        let sSourceName = oSource.sId.split('--').pop()

        if (sSourceName == 'ButtonAddGrouping') {
          let sSelectedIconTab = oView.byId('idIconTabBarMulti').getSelectedKey()
          switch (sSelectedIconTab) {
            case 'profiles':
              oInput = oView.byId('AuthoridGroup')
              oLabel = oView.byId('AuthoridGroupLabel')
              break
            case 'groupsProfiles':
              oInput = oView.byId('GroupidPF')
              oLabel = oView.byId('GroupidPFLabel')
              break
          }
        }

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
            this.showMessage('W', 'Parceiro ja está no grupo!')
          }
        } else {
          this.showMessage('E', 'Parceiro informato é invalido!')
        }
      },

      onDelGrouping: function () {
        //debugger

        let that = this
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListGrouping')

        let sRefkey = ''
        let sNamespace =
          this.getOwnerComponent().getManifestEntry('/sap.app/id')

        oList.getSelectedItems().forEach(function (item) {
          oList.removeItem(item.sId)
          sRefkey = item.mProperties.title

          let oPath =
            "/groupingSet(Namespace='" +
            sNamespace +
            "',Groupid='" +
            gGroupid +
            "',Refkey='" +
            sRefkey +
            "')"
          gItemsDel.push(oPath)
        })
      },
      onSaveGrouping: function () {
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

        let sRefkey = ''

        gItemsAdd.forEach(function (oItem) {
          sRefkey = oItem.mProperties.title

          oModel.createEntry('/groupingSet', {
            properties: {
              Namespace: sNamespace,
              Groupid: gGroupid,
              Refkey: sRefkey,
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
      onDeselectAllList: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListGrouping')
        oList.removeSelections()
      },
      onSelectAllList: function () {
        //debugger
        let oView = this.getView()
        let oModel = oView.getModel()
        let oList = oView.byId('ListGrouping')
        oList.selectAll()
      },
      createInput: function (oView, that, field, oSimpleForm) {
        //debugger
        var label = new sap.m.Label({ text: field.ScrtextM })
        oSimpleForm.addContent(label)

        var oInput = new Input({
          id: oView.sId + '--' + field.Fieldname + field.Precfield,
          visible: true,
          //placeholder: field.Fieldname,
          showSuggestion: field.Suggestion,
          showValueHelp: field.Valuehelp
        })

        if (field.Suggestion) {
          oInput.attachLiveChange(function (oEvent) {
            that.onLiveChange(oEvent)
          })
          oInput.attachSuggest(function () {
            that.onSuggestion(oInput, '')
          })
        }
        if (field.Valuehelp) {
          oInput.attachValueHelpRequest(function (oEvent) {
            that.onSearchHelp(oEvent)
          })
        }
        if (field.Valexi) {
          oInput.attachChange(function (oEvent) {
            that.onCheckInput(oEvent)
          })
        }

        if (field.Submit != '') {
          oInput.attachSubmit(function (oEvent) {
            that.onSubmitInput(oEvent)
          })
        }

        // Adiciona atributos personalizados
        oInput.data('SuggestionTable', field.Suggestiontable) // Substitua com o valor apropriado
        oInput.data('DataType', field.Datatype)
        oInput.data('Leng', field.Leng)
        oInput.data('Mask', field.Mask)
        oInput.data('Decimals', field.Decimals)
        oInput.data('UpperCase', !field.Lowercase)
        oInput.data('Valexi', field.Valexi)
        oInput.data('TableName', field.Tablename)
        oInput.data('FieldName', field.Fieldname)
        oInput.data('Submit', field.Submit)
        oInput.data('Filter', field.Filter)

        oInput.setValue(field.Value)

        // Adicione o controle Input à sua visualização
        oSimpleForm.addContent(oInput)

        var text = new sap.m.Text({
          id: oView.sId + '--' + field.Fieldname + field.Precfield + 'Label',
          text: ''
        })
        oSimpleForm.addContent(text)
      },
      onIconTabBarSelect: function (oEvent) {
        //debugger
        let oView = this.getView()
        let oList = oView.byId('ListGrouping')

        switch (oEvent.getSource().getSelectedKey()) {
          case 'profiles':
            this.getLinkGroupTo(gContext, 'profiles', oList)
            break
          case 'groupsProfiles':
            this.getLinkGroupTo(gContext, 'groupsProfiles', oList)
            break
          case 'group':
              this.getLinkGroupTo(gContext, 'grouping', oList)
              break
          }

        oEvent.getSource().getSelectedKey()
      },
      getLinkGroupTo: function (vContext, vNavTo, vList) {
        //debugger
        let that = this
        let sNavTo = vNavTo
        let oList = vList
        let oView = this.getView()
        let oModel = oView.getModel()
        let sSelectedIconTab = oView.byId('idIconTabBarMulti').getSelectedKey()
        
        if (!sSelectedIconTab) {
          sSelectedIconTab = 'group'
        }

        oList.removeAllItems()

        oModel.read(vContext, {
          urlParameters: {
            $expand: sNavTo
          },
          success: function (oData, oResponse) {
            //debugger
            
            switch (sSelectedIconTab) {
              case 'group':
                let oGrouping = oData.grouping.results
                oGrouping.forEach(function (grouping) {
                  let oItem = new sap.m.StandardListItem()
                  oItem.setTitle(grouping.Refkey)
                  oItem.setDescription(grouping.Name1)
                  oList.addItem(oItem)
                })
                break
              case 'profiles':
                let oProfiles = oData.profiles.results
                oProfiles.forEach(function (profile) {
                  let oItem = new sap.m.StandardListItem()
                  oItem.setTitle(profile.Refkey)
                  oItem.setDescription(profile.Name1)
                  oList.addItem(oItem)
                })
                break
              case 'groupsProfiles':
                let oGroupProfiles = oData.groupsProfiles.results
                oGroupProfiles.forEach(function (profile) {
                  let oItem = new sap.m.StandardListItem()
                  oItem.setTitle(profile.Refkey)
                  oItem.setDescription(profile.Name1)
                  oList.addItem(oItem)
                })
                break
            }
          },
          error: function (oError) { }
        })

       
      }
    })
  }
)
