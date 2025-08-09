sap.ui.define(
  [
    "./CommomController",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "../model/models",
    "sap/m/UploadCollectionParameter",
  ],
  function (
    CommomController,
    UIComponent,
    mobileLibrary,
    Fragment,
    MessageBox,
    models,
    UploadCollectionParameter
  ) {
    "use strict";

    var gValue = "";
    var gInputId = "";
    var gInput = "";
    var gObjInput;

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return CommomController.extend(
      "xcop.fsc.service.controller._BaseController",
      {
        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter: function () {
          //debugger
          return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel: function (sName) {
          return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Event handler when the share by E-Mail button has been clicked
         * @public
         */
        onStateChanged: function () {},
        onToken: function () {
          //debugger

          let oModel = this.getView().getModel();
          let sToken = oModel.getSecurityToken();
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");
          let oView = this.getView();
          let vContext =
            "tokenSet(Token='" + sToken + "',Namespace='" + sNamespace + "')";

          return new Promise(function (resolve, reject) {
            oModel.read("/" + vContext, {
              success: function (oData, oResponse) {
                oView.getModel("token").setData(oData);
                oModel.refresh();
                resolve(oData);
              },
              error: function (oError) {
                reject(oError);
              },
            });
          });
        },

        onConfig: function () {
          //debugger
          // let oModel = this.getView().getModel()
          // let sToken = oModel.getSecurityToken()
          // let sNamespace =
          //   this.getOwnerComponent().getManifestEntry('/sap.app/id')
          // let oView = this.getView()
          // let vContext = "configSet(Namespace='" + sNamespace + "',Token='" + sToken + "')"
          // oModel.read('/' + vContext, {
          //   success: function (oData, oResponse) {
          //     oView.getModel('config').setData(oData)
          //     oModel.refresh()
          //   },
          //   error: function (oError) {}
          // })
        },

        onMenu: function (sViewName, sContext) {
          //debugger
          let oView = this.getView();
          let oModel = this.getView().getModel();
          let oModelMenu = sContext;
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");

          let sToken = oModel.getSecurityToken();

          var vContext =
            "menuSet(Token='" +
            sToken +
            "',Namespace='" +
            sNamespace +
            "',Viewname='" +
            sViewName +
            "',Context='" +
            sContext +
            "')";

          oModel.read("/" + vContext, {
            urlParameters: {
              $expand: "navigation,navigation/items,settings,fixedNavigation",
            },
            success: function (oData, oResponse) {
              //debugger
              oView.getModel(oModelMenu).setData(oData);
              oModel.refresh();
              let teste = oView.getModel(oModelMenu);
            },
            error: function (oError) {},
          });
        },
        onCollapseExpandPress: function () {
          //debugger
          var oSideNavigation = this.byId("app");
          var bExpanded = oSideNavigation.getSideExpanded();

          oSideNavigation.setSideExpanded(!bExpanded);
        },

        onClickMenu: function (oEvent) {
          //debugger
          oEvent = jQuery.extend(true, {}, oEvent);
          let oRouter = this.getRouter();

          let oItem = oEvent.getSource().getProperty("key");
          let oParent;

          try {
            oParent = oEvent.getSource().getParent().getProperty("key");
          } catch (erro) {
            oParent = "";
          }

          //let oKey = oParent+oItem;
          let sKey = oItem.split("-")[0];
          let sNavto = oItem.split("-")[1];
          //sap.m.MessageToast.show(oKey);

          if (sNavto !== "") {
            oRouter.navTo(sNavto);
          } else {
          }
        },

        onPopupLogin: function () {
          //debugger
          var oView = this.getView();

          if (!this.byId("openDialogLogin")) {
            Fragment.load({
              id: oView.getId(),
              name: "xcop.fsc.service.view.fragments.fmLogin",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("openDialogLogin").open();
          }
        },

        onCancelLogin: function () {
          let oDialog = this.byId("openDialogLogin");
          let oLifnr = this.byId("Lifnr");
          let oPass = this.byId("Password");

          oLifnr.setValue("");
          oPass.setValue("");
          oDialog.close();
        },

        onLogin: function () {
          //debugger
          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();
          let oDialog = this.byId("openDialogLogin");
          let oLogin = this.byId("Button:Login");
          let oLogout = this.byId("Button:Logout");
          let oRouter = this.getRouter();

          let sToken = oModel.getSecurityToken();
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");
          let oPass = oView.byId("Password");
          let sHashedPass = btoa(oPass.getValue());
          let sUser = this.byId("Lifnr").getValue();

          oModel.callFunction("/fm_login", {
            method: "GET",
            urlParameters: {
              Token: sToken,
              User: sUser,
              Password: sHashedPass,
              Namespace: sNamespace,
            },
            success: function (dados, resposta) {
              //debugger
              let mensagem = JSON.parse(resposta.headers["sap-message"]);
              that.onCancelLogin();
              that.onToken();

              if (mensagem.severity == "success") {
                that.onCancelLogin();
                oLogin.setVisible(false);
                oLogout.setVisible(true);
                window.location.reload();
              } else {
                MessageBox.error(mensagem.message, {
                  actions: ["OK"],
                  onClose: function (sAction) {
                    if (sAction == "OK") {
                      that.onCancelLogin();
                    }
                  },
                });
              }
            },
            error: function (oError) {
              sap.m.MessageToast.show("Erro serviço SEGW!");
            },
          });
        },

        onLogout: function () {
          //debugger
          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();
          let sToken = oModel.getSecurityToken();
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");
          let oLogin = this.byId("Button:Login");
          let oLogout = this.byId("Button:Logout");
          let oRouter = this.getRouter();

          oModel.callFunction("/fm_logout", {
            method: "GET",
            urlParameters: {
              Token: sToken,
              Namespace: sNamespace,
            },
            success: function (dados, resposta) {
              //debugger
              let mensagem = JSON.parse(resposta.headers["sap-message"]);
              let sObject = dados;

              if (mensagem.severity == "success") {
                oLogin.setVisible(true);
                oLogout.setVisible(false);
                sap.m.MessageToast.show(mensagem.message);
                that.onToken();
              } else {
                MessageBox.error(mensagem.message, {
                  actions: ["OK"],
                  onClose: function (sAction) {
                    if (sAction == "OK") {
                      oDialog.close();
                      that.onScreenControl();
                      //oRouter.navTo("home")
                    }
                  },
                });
              }

              window.location.reload();
            },
            error: function (oError) {
              sap.m.MessageToast.show("Erro serviço Odata!");
              window.location.reload();
            },
          });
        },

        onGetDomainValues: function (vDomain, vTable) {
          //debugger
          let that = this;
          let oModel = this.getView().getModel();
          let oView = this.getView();

          if (vTable === "") {
            // let mHeaders = {
            //   domname: vDomain
            // }
            // oModel.setHeaders(mHeaders)

            let vContext = "getDomainSet('" + vDomain + "')";
            vContext = vContext.replaceAll("/", "%2F");

            return new Promise(function (resolve, reject) {
              oModel.read("/" + vContext, {
                urlParameters: {
                  $expand: "values",
                },
                success: function (oData, oResponse) {
                  //debugger
                  that.setModel(models.createBlankJSONModel(), vDomain);
                  oView.getModel(vDomain).setData(oData.values);

                  resolve(oData);
                },
                error: function (oError) {
                  reject(oError);
                },
              });
            });
          } else {
            let sToken = oModel.getSecurityToken();
            let sNamespace =
              this.getOwnerComponent().getManifestEntry("/sap.app/id");

            let sField = vTable.split(":")[1];
            let sTable = vTable.split(":")[0];

            let mHeaders = {
              token: sToken,
              namespace: sNamespace,
              table: sTable,
              field: sField,
            };

            oModel.setHeaders(mHeaders);

            var vContext = "suggestionSet";

            return new Promise(function (resolve, reject) {
              oModel.read("/" + vContext, {
                success: function (oData, oResponse) {
                  //debugger
                  that.setModel(models.createBlankJSONModel(), vDomain);
                  let aDomains = [];

                  for (var i = 0; i < oData.results.length; i++) {
                    let sDomain = {
                      Key: oData.results[i].Result.split("--")[0],
                      Title: oData.results[i].Result.split("--")[1],
                    };

                    aDomains.push(sDomain);
                  }

                  let aResults = {
                    results: aDomains,
                  };
                  oView.getModel(vDomain).setData(aResults);
                  resolve(oData);
                },
                error: function (oError) {
                  reject();
                },
              });
            });
          }
        },

        onGetViews: function () {
          //debugger

          let sViews = this.getOwnerComponent().getManifestEntry(
            "/sap.ui5/routing/targets"
          );
          let oJsonModel = this.getView().getModel("views");

          oJsonModel.setData({
            viewSet: sViews,
          });
        },

        onChangeViewList: function () {
          //debugger
          let oView = this.getView();
          let sView = oView.byId("SelectView").getSelectedKey();
          let oComponent = this.getOwnerComponent();
          this.onListControls();
        },
        onListControls: function () {
          //debugger

          let aViewSplit = this.byId("app")
            .getMainContents()[0]
            .oToPage.sId.split("-");
          let sViewId = aViewSplit[aViewSplit.length - 1];

          let sComponents = this.byId("app")
            .getMainContents()[0]
            .oToPage.getControlsByFieldGroupId("");

          let aComponents = [];
          let oJsonModel = this.getView().getModel("components");

          for (var i = 0; i < sComponents.length; i++) {
            if (sComponents[i].sId.includes(sViewId) === true) {
              let arrayId = sComponents[i].sId.split(sViewId + "--");
              if (arrayId.length == 2) {
                if (arrayId[1].includes("-") === false) {
                  let sVisible = sComponents[i].mProperties.visible;

                  if (arrayId[1].includes(":") === true) {
                    let vId = {
                      id: arrayId[1],
                    };

                    aComponents.push(vId);
                  }
                }
              }
            }
          }

          oJsonModel.setData({
            componentsSet: aComponents,
          });
        },
        onCreateEntryScreen: function () {
          //debugger
          var sServiceUrl = this.getOwnerComponent().getManifestEntry(
            "/sap.app/dataSources/mainService/uri"
          );
          var oModelOptions;
          var oNewModel = new sap.ui.model.odata.v2.ODataModel(
            sServiceUrl,
            oModelOptions
          );

          let oView = this.getView();
          let oList = oView.byId("ListFields");
          let oItems = oList.getSelectedItems();

          //let sFieldname      = oView.byId("SelectFieldname").getSelectedKey();
          let sViewname = oView.byId("ViewId").getValue();
          let sUserid = oView.byId("UserId").getValue();
          let sLifnr = oView.byId("Lifnr").getValue();
          let sActive = true;
          //let sActive         = oView.byId("Active").mProperties.selected;

          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");

          for (var i = 0; i < oItems.length; i++) {
            let sFieldname = oItems[i].mProperties.title;

            oNewModel.createEntry("/screenControlTableSet", {
              properties: {
                Namespace: sNamespace,
                Viewname: sViewname,
                Fieldname: sFieldname,
                Active: sActive,
                Userid: sUserid,
                Lifnr: sLifnr,
              },
            });
          }

          this.onSaveScreen();
        },
        onSaveScreen: function () {
          //debugger
          var sServiceUrl = this.getOwnerComponent().getManifestEntry(
            "/sap.app/dataSources/mainService/uri"
          );
          var oModelOptions;
          var oNewModel = new sap.ui.model.odata.v2.ODataModel(
            sServiceUrl,
            oModelOptions
          );

          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();

          if (oNewModel.hasPendingChanges()) {
            oNewModel.submitChanges({
              success: function (oData, resposta) {
                //debugger
                oModel.refresh(true);
                that.onCancelDialogScreen();
              },
              error: function (erro) {
                //debugger
                var sTargetPos = "center center";
                sTargetPos = sTargetPos === "default" ? undefined : sTargetPos;
                sap.m.MessageToast.show("Erro update", {
                  onClose: fnResolve,
                  duration: 2000 || 2000,
                  at: sTargetPos,
                  my: sTargetPos,
                });
              },
            });
          }

          if (oModel.hasPendingChanges()) {
            oModel.submitChanges({
              success: function (oData, resposta) {
                //debugger
                oModel.refresh(true);
                let oSmartTable = oView.byId("smartTableScreen");
                oSmartTable.setEditable(false);
              },
              error: function (erro) {
                //debugger
                var sTargetPos = "center center";
                sTargetPos = sTargetPos === "default" ? undefined : sTargetPos;
                sap.m.MessageToast.show("Erro update", {
                  onClose: fnResolve,
                  duration: 2000 || 2000,
                  at: sTargetPos,
                  my: sTargetPos,
                });
              },
            });
          }
        },
        onAddFieldsScreen: function () {
          //debugger

          let aViewSplit = this.byId("app")
            .getMainContents()[0]
            .oToPage.sId.split("-");
          let sViewId = aViewSplit[aViewSplit.length - 1];

          let oView = this.getView();
          let that = this;

          this.onGetViews();
          this.onListControls();

          if (!this.byId("openDialogScreen")) {
            Fragment.load({
              id: oView.getId(),
              name: "xcop.fsc.service.view.fragments.fmCreateScreen",
              controller: this,
            }).then(function (oDialog) {
              //debugger
              oView.addDependent(oDialog);
              oDialog.open();
              oView.byId("ViewId").setValue(sViewId);
              that.onListFieldsScreen();
            });
          } else {
            this.byId("openDialogScreen").open();
          }
        },
        onListFieldsScreen: function () {
          //debugger

          let oView = this.getView();
          let oList = oView.byId("ListFields");
          let oComponents = oView.getModel("components").oData;
          oList.removeAllItems();

          oComponents.oData.forEach(function (sComponent) {});

          for (var i = 0; oComponents.componentsSet.length; i++) {
            let sComponent = oComponents.componentsSet[i];
            let oItem = new sap.m.StandardListItem();
            oItem.setTitle(sComponent.id);
            //oItem.setDescription(sCOmponent.id);

            oList.addItem(oItem);
          }
        },
        onDeleteScreen: function () {
          //debugger
          let that = this;
          let oModel = this.getView().getModel();
          let oTable = this.getView().byId("tableAux");
          let aContexts = oTable.getSelectedContexts();

          MessageBox.warning("Excluir itens selecionados?", {
            actions: ["Sim", "Não"],
            onClose: function (sAction) {
              if (sAction == "Sim") {
                for (var i = aContexts.length - 1; i >= 0; i--) {
                  var oPath = aContexts[i].sPath;
                  oModel.remove(oPath);
                }

                that.getView().getModel().refresh(true);
              }
            },
          });
        },

        onSelectAllFields: function () {
          //debugger
          let oView = this.getView();
          let oList = this.getView().byId("ListFields");
          oList.selectAll();
        },

        onDeselectAllFields: function () {
          //debugger
          let oView = this.getView();
          let oList = this.getView().byId("ListFields");
          oList.removeSelections();
        },

        onDeleteFields: function (oEvent) {
          //debugger

          let oView = this.getView();
          let oList = oView.byId("ListFields");
          let oModel = oView.getModel();
          let that = this;
          let oItems = oList.getSelectedItems();

          if (oItems.length > 0) {
            MessageBox.warning("Excluir da lista usuários selecionados?", {
              actions: ["Sim", "Não"],
              onClose: function (sAction) {
                if (sAction == "Sim") {
                  for (var i = 0; i < oItems.length; i++) {
                    oList.removeItem(oItems[i]);
                  }
                }
              },
            });
          }
        },

        onCancelDialogScreen: function () {
          //debugger

          if (this.byId("openDialogScreen")) {
            this.byId("openDialogScreen").close();
            this.byId("openDialogScreen").destroy();
          }
        },

        onRefreshModel: function () {
          this.getView().getModel().refresh(true);
        },

        onSaveModelSmart: function (oEvent) {
          //debugger

          oEvent = jQuery.extend(true, {}, oEvent);

          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();
          let sSmartTable = oEvent.getSource().oParent.oParent.sId.split("-")[
            oEvent.getSource().oParent.oParent.sId.split("-").length - 1
          ];
          let oSmartTable = oView.byId(sSmartTable);

          if (oModel.hasPendingChanges()) {
            oModel.submitChanges({
              success: function (oData, resposta) {
                //debugger
                let mensagem = JSON.parse(
                  resposta.data.__batchResponses[0].__changeResponses[0]
                    .headers["sap-message"]
                );
                oModel.refresh(true);

                if (mensagem.severity == "success") {
                  oSmartTable.setEditable(false);
                } else {
                  MessageBox.warning(mensagem.message, {
                    actions: ["OK"],
                    onClose: function (sAction) {
                      if (sAction == "OK") {
                        //Incluir alguma lógica caso queira
                      }
                    },
                  });
                }
              },
              error: function (erro) {
                //debugger
                var sTargetPos = "center center";
                sTargetPos = sTargetPos === "default" ? undefined : sTargetPos;
                sap.m.MessageToast.show("Erro update", {
                  onClose: fnResolve,
                  duration: 2000 || 2000,
                  at: sTargetPos,
                  my: sTargetPos,
                });
              },
            });
          } else {
            MessageBox.warning("Não houve alteração dos dados!", {
              actions: ["OK"],
              onClose: function (sAction) {
                if (sAction == "OK") {
                  oSmartTable.setEditable(false);
                }
              },
            });
          }
        },
        setModelHeader: function (oModel) {
          //debugger
          let sToken = oModel.getSecurityToken();
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");

          let mHeaders = {
            token: sToken,
            namespace: sNamespace,
          };
          oModel.setHeaders(mHeaders);
        },

        onSearchHelp: function (oEvent) {
          //debugger
          var that = this;
          var oView = this.getView();
          let oModel = oView.getModel();

          let oSource = oEvent.getSource();
          let sInputId = oSource.sId;
          let oInput = oView.byId(sInputId);

          if (!oInput) {
            oInput = oSource;
          }

          let NoZero = oInput.data("NoZero");

          let sToken = oModel.getSecurityToken();
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");

          gInputId = sInputId;
          gObjInput = oInput;

          let SuggestionTable = oInput.data("SuggestionTable");
          let sMask = oInput.data("Mask");
          let sFilter = oInput.data("Filter");
          let sField = "";
          let sTable = "";
          let sHelp = "";
          let sValue = "";

          if (SuggestionTable === "") {
            sTable = oInput.data("TableName");
            sField = oInput.data("FieldName");
            sHelp = "X";
          } else {
            let oInputParams = SuggestionTable.split(":");
            sTable = oInputParams[0];
            sField = oInputParams[1];
          }

          if (NoZero || NoZero == "X") {
            sMask = "NoZero";
          }

          let mHeaders = {
            token: sToken,
            namespace: sNamespace,
            shelp: sHelp,
            table: sTable,
            field: sField,
            value: sValue,
            filter: sFilter,
            mask: sMask,
          };

          oModel.setHeaders(mHeaders);

          var vContext = "suggestionSet";
          oModel.read("/" + vContext, {
            success: function (oData, oResponse) {
              //debugger

              if (!that._pPopoverNode) {
                that._pPopoverNode = Fragment.load({
                  id: oView.createId("searchHelp"),
                  name: "xcop.fsc.service.view.fragments.fmSearchHelp",
                  controller: that,
                }).then(function (oPopoverNode) {
                  oView.addDependent(oPopoverNode);
                  return oPopoverNode;
                });
              }

              that._pPopoverNode.then(function (oPopoverNode) {
                //debugger
                let sViewId = oView.sId;
                let oList = oView.byId(
                  sViewId + "--searchHelp--ListSuggestion"
                );

                oList.removeAllItems();

                for (var i = 0; i < oData.results.length; i++) {
                  let oItem = new sap.m.StandardListItem();
                  let sResult = "";
                  let sSep = "";

                  for (
                    var j = 0;
                    j < oData.results[i].Result.split("--").length;
                    j++
                  ) {
                    if (j === 1) {
                      sSep = " - ";
                    } else if (j != 0) {
                      sSep = " ";
                    }

                    if (oData.results[i].Result.split("--")[j] != "") {
                      sResult =
                        sResult + sSep + oData.results[i].Result.split("--")[j];
                    }
                  }
                  oItem.setTitle(sResult);
                  oList.addItem(oItem);
                }
                oPopoverNode.open();
                let oInputSh = oView.byId(
                  sViewId + "--searchHelp--valueSearchHelpId"
                );
                oInputSh.setValue();
              });
            },
            error: function (oError) {},
          });
        },

        onSearchHelpChange: function () {
          //debugger;
          var that = this;
          var oView = this.getView();
          let oModel = oView.getModel();

          let sInputId = gInputId;

          let oInput = oView.byId(gInputId);
          if (!oInput) {
            oInput = gObjInput;
          }

          let UpperCase = oInput.data("UpperCase");
          let NoZero = oInput.data("NoZero");

          let sToken = oModel.getSecurityToken();
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");

          let SuggestionTable = oInput.data("SuggestionTable");
          let sMask = oInput.data("Mask");
          let sField = "";
          let sTable = "";
          let sHelp = "";
          let sFilter = "";

          let sViewId = oView.sId;
          let sValue = oView
            .byId(sViewId + "--searchHelp--valueSearchHelpId")
            .getValue();

          if (UpperCase || UpperCase == "X") {
            sValue = sValue.toUpperCase();
          }

          if (NoZero || NoZero == "X") {
            sMask = "NoZero";
          }

          if (SuggestionTable === "") {
            sTable = oInput.data("TableName");
            sField = oInput.data("FieldName");
            sFilter = oInput.data("Filter");
            sHelp = "X";
          } else {
            let oInputParams = SuggestionTable.split(":");
            sTable = oInputParams[0];
            sField = oInputParams[1];
            sFilter = oInput.data("Filter");
          }

          let mHeaders = {
            token: sToken,
            namespace: sNamespace,
            shelp: sHelp,
            table: sTable,
            field: sField,
            value: sValue,
            mask: sMask,
            filter: sFilter,
          };

          oModel.setHeaders(mHeaders);

          var vContext = "suggestionSet";
          oModel.read("/" + vContext, {
            success: function (oData, oResponse) {
              //debugger

              let sViewId = oView.sId;
              let oList = oView.byId(sViewId + "--searchHelp--ListSuggestion");

              oList.removeAllItems();

              for (var i = 0; i < oData.results.length; i++) {
                let oItem = new sap.m.StandardListItem();
                let sResult = "";
                let sSep = "";

                for (
                  var j = 0;
                  j < oData.results[i].Result.split("--").length;
                  j++
                ) {
                  if (j === 1) {
                    sSep = " - ";
                  } else if (j != 0) {
                    sSep = " ";
                  }
                  if (oData.results[i].Result.split("--")[j] != "") {
                    sResult =
                      sResult + sSep + oData.results[i].Result.split("--")[j];
                  }
                }
                oItem.setTitle(sResult);
                //oItem.setTitle(oData.results[i].Result)
                oList.addItem(oItem);
              }
            },
            error: function (oError) {},
          });
        },

        onSearchHelpSelection: async function () {
          //debugger

          let oView = this.getView();
          let sViewId = oView.sId;
          let oList = oView.byId(sViewId + "--searchHelp--ListSuggestion");
          let sValue = oList
            .getSelectedItem()
            .mProperties.title.split(" - ")[0];

          let oInputSh = oView.byId(
            sViewId + "--searchHelp--valueSearchHelpId"
          );
          oInputSh.setValue();

          let oInput = oView.byId(gInputId);
          if (!oInput) {
            oInput = gObjInput;
          }

          oInput.setValue(sValue);

          let oLabel = oView.byId(gInputId + "Label");

          let sText = oList.getSelectedItem().mProperties.title.split(" - ")[1];

          if (oLabel) {
            oLabel.setText(sText);
          } else if (sText) {
            oInput.setValue(sValue + " - " + sText);
          }

          oInput.setValueState("None");
          let sMode = oInput.data("Fmode");

          if (sMode) {
            this.executeFunctionMode(oInput);
          }

          let oPopover = oView.byId(
            sViewId + "--searchHelp--openDialogSearhHelp"
          );
          oPopover.close();
          //oPopover.destroy()
        },

        onSelectUser: function () {
          //debugger
          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();

          let oBname = oView.byId("Bname");
          let oSmtpAddr = oView.byId("SmtpAddr");

          let oTelNumber = oView.byId("TelNumber");
          let sMask = oTelNumber.data("Mask");
          let sLeng = oTelNumber.data("Leng");

          let sBname = oBname.getValue();
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");

          let vContext =
            "usersSet(Namespace='" + sNamespace + "',Bname='" + sBname + "')";

          oModel.read("/" + vContext, {
            success: function (oData, oResponse) {
              //debugger
              oSmtpAddr.setValue(oData.SmtpAddr);
              oTelNumber.setValue(
                that.formatMask(oData.TelNumber, sMask, sLeng)
              );
            },
            error: function (oError) {},
          });
        },

        onFormaterInput: function (oEvent) {
          //debugger
          oEvent = jQuery.extend(true, {}, oEvent);
          let oView = this.getView();
          let oInput = oView.byId(sInputId);
          let UpperCase = oInput.data("UpperCase");
          let sValue = oInput.getValue();

          if (UpperCase === "X" || UpperCase) {
            sValue = sValue.toUpperCase();
            oInput.setValue(sValue);
          }
        },

        onLiveChange: function (oEvent) {
          //debugger

          oEvent = jQuery.extend(true, {}, oEvent);
          let oView = this.getView();
          let oModel = oView.getModel();
          let oSource = oEvent.getSource();
          let sInputId = oSource.sId;
          let oInput = oView.byId(sInputId);
          let sValue = oInput.getValue();

          let SugestionShow = oInput.getProperty("showSuggestion");
          let DataType = oInput.data("DataTypee");
          let Leng = oInput.data("Leng");
          let Mask = oInput.data("Mask");
          let Decimals = oInput.data("Decimals");
          let UpperCase = oInput.data("UpperCase");
          let NoZero = oInput.data("NoZero");
          let Valexi = oInput.data("Valexi");

          if (sValue.includes(" - ") && sValue.split(" - ")[0].length > Leng) {
            this.showMessage("E", "Valor máximo de caracteres: " + Leng);
            oInput.setValue(sValue.slice(0, Leng));
            return;
          }

          if (!Valexi) {
            if (UpperCase === "X" || UpperCase) {
              sValue = sValue.toUpperCase();
              oInput.setValue(sValue);
            }

            if (NoZero === "X" || NoZero) {
              sValue = sValue.replace(/^0+/, "");
              oInput.setValue(sValue);
            }
          }

          //debugger
          if (Mask !== "") {
            sValue = this.formatMask(sValue, Mask, Leng);
            oInput.setValue(sValue);
          }

          if (SugestionShow === true) {
            this.onSuggestion(oInput, "");
          }
        },

        showMessage: function (sType, sMessage) {
          //debugger
          let oRouter = this.getRouter();
          let sTargetPos = "center center";
          sTargetPos = sTargetPos === "default" ? undefined : sTargetPos;

          switch (sType) {
            case "E":
              MessageBox.error(sMessage, {
                actions: ["OK"],
                onClose: function (sAction) {
                  if (sAction == "OK") {
                  }
                },
              });
              break;
            case "S":
              MessageBox.success(sMessage, {
                actions: ["OK"],
                onClose: function (sAction) {
                  if (sAction == "OK") {
                    //Incluir alguma lógica caso queira
                  }
                },
              });
              break;
            case "W":
              MessageBox.warning(sMessage, {
                actions: ["OK"],
                onClose: function (sAction) {
                  if (sAction == "OK") {
                    //Incluir alguma lógica caso queira
                  }
                },
              });
              break;
          }
        },

        formatMask: function (sValue, sMask, sLeng) {
          //debugger

          let sValueFormatter = "";
          let sIndex = 0;
          let sValueLength = sValue.length;

          if (sValue.length == sLeng) {
            for (let i = 0; i < sMask.length; i++) {
              if (sMask.charAt(i) === sMask.charAt(0)) {
                sValueFormatter += sValue.charAt(sIndex);
                sIndex++;
              } else {
                sValueFormatter += sMask.charAt(i);
              }
            }
          } else {
            sValueFormatter = sValue;
          }

          return sValueFormatter;
        },
        onSuggest: function (oEvent) {
          //debugger

          var sValue = oEvent.getParameter("suggestValue");
          var oInput = oEvent.getSource();
          var aSuggests = oInput.getSuggestionItems();

          /**
           * Avaliar para buscar nas lista de sugestão nao apenas quando estiver no começo mas conter na lista.
           */
        },
        onSuggestion: function (oInput, cX) {
          //debugger
          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();
          let sValue = oInput.getValue();
          let UpperCase = oInput.data("UpperCase");
          let NoZero = oInput.data("NoZero");

          let sToken = oModel.getSecurityToken();
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");

          let SuggestionTable = oInput.data("SuggestionTable");
          let sField = "";
          let sTable = "";
          let sHelp = "";
          let sFilter = "";
          let sMask = oInput.data("Mask");

          let sMod = Math.abs(gValue.length - sValue.length);

          if (UpperCase || UpperCase == "X") {
            sValue = sValue.toUpperCase();
          }

          if (NoZero || NoZero == "X") {
            sValue = sValue.replace(/^0+/, "");
            sMask = "NoZero";
          }

          if (cX != "") {
            sValue = "";
          }

          if (
            sMod > 2 ||
            oInput.getSuggestionItems().length === 0 ||
            cX != ""
          ) {
            gValue = sValue;
            if (SuggestionTable === "") {
              sTable = oInput.data("TableName");
              sField = oInput.data("FieldName");
              sFilter = oInput.data("Filter");
              sHelp = "X";
            } else {
              let oInputParams = SuggestionTable.split(":");
              sTable = oInputParams[0];
              sField = oInputParams[1];
              sFilter = oInput.data("Filter");
            }

            let mHeaders = {
              token: sToken,
              namespace: sNamespace,
              shelp: sHelp,
              table: sTable,
              field: sField,
              value: sValue,
              filter: sFilter,
              mask: sMask,
            };
            oModel.setHeaders(mHeaders);

            if (sValue.length > 0 || cX != "") {
              var vContext = "suggestionSet";

              oModel.read("/" + vContext, {
                success: function (oData, oResponse) {
                  //debugger

                  let oModelSHelp = that.getView().getModel("searchHelp");

                  if (oData.results.length > 0) {
                    oInput.removeAllSuggestionItems();
                    oModelSHelp.setData(oData);
                  }

                  for (var i = 0; i < oData.results.length; i++) {
                    let sResult = "";

                    for (
                      var j = 0;
                      j < oData.results[i].Result.split("-").length;
                      j++
                    ) {
                      if (j > 0) {
                        sResult =
                          sResult + " " + oData.results[i].Result.split("-")[j];
                      }
                    }

                    let oItem = new sap.ui.core.ListItem({
                      text: oData.results[i].Result.split("-")[0],
                      additionalText: sResult, // Segunda coluna
                    });

                    oInput.addSuggestionItem(oItem);
                  }
                },
                error: function (oError) {},
              });
            } else {
              // sap.m.MessageToast.show("não tem mais q 3" + sMatricula);
            }
          }
        },

        onSubmitInput: function (oEvent) {
          //debugger

          let oView = this.getView();
          let oSource = oEvent.getSource();
          let oInput = oView.byId(oSource.sId);
          let sSubmit = oInput.data("Submit");
          let sMode = oInput.data("Fmode");

          let sCheckInput = this.onCheckInput(oEvent);

          if (sCheckInput && sSubmit) {
            this[sSubmit](oEvent);
          }

          if (sMode) {
            this.executeFunctionMode(oInput);
          }
        },
        onCheckInput: async function (oEvent) {
          //debugger;
          //Atualizar código
          let that = this;
          let oSource = "";

          if (oEvent.sId === "change") {
            try {
              oSource = oEvent.getSource();
            } catch (error) {
              oSource = oEvent.oSource;
            }
          } else {
            oSource = oEvent;
          }

          let oView = this.getView();
          let oModel = oView.getModel();
          let oInput = oView.byId(oSource.sId);

          if (!oInput) {
            try {
              oInput = oEvent.getSource();
            } catch (error) {
              oInput = oSource;
            }
          }

          let sValue = oInput.getValue();
          let oLabel = oView.byId(oSource.sId + "Label");
          let UpperCase = oInput.data("UpperCase");
          let NoZero = oInput.data("NoZero");
          let sSubmit = oInput.data("Submit");
          let Valexi = oInput.data("Valexi");

          let ReturnDescript = oInput.data("ReturnDescript");
          let DescriptId = oInput.data("DescriptId");
          let NoDescript = oInput.data("NoDescript");

          oInput.data("Event", oEvent);

          let sToken = oModel.getSecurityToken();
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");

          let SuggestionTable = oInput.data("SuggestionTable");
          let sField = "";
          let sTable = "";
          let sHelp = "";
          let sFilter = "";
          let sMask = oInput.data("Mask");

          if (SuggestionTable === "") {
            sTable = oInput.data("TableName");
            sField = oInput.data("FieldName");
            sFilter = oInput.data("Filter");
            sHelp = "X";
          } else {
            let oInputParams = SuggestionTable.split(":");
            sTable = oInputParams[0];
            sField = oInputParams[1];
          }

          if (UpperCase || UpperCase == "X") {
            sValue = sValue.toUpperCase();
          }

          if (NoZero || NoZero == "X") {
            sValue = sValue.replace(/^0+/, "");
            sMask = "NoZero";
          }

          let mHeaders = {
            token: sToken,
            namespace: sNamespace,
            shelp: sHelp,
            table: sTable,
            field: sField,
            value: sValue,
            filter: sFilter,
            mask: sMask,
          };

          oModel.setHeaders(mHeaders);

          // if (sSubmit) {
          //   await that[sSubmit](oInput);
          // }

          let vContext = "/suggestionSet";
          let state = "Error";
          let sText = "";

          let oData = await this.oModelRead(vContext, "");

          oData.results.forEach(function (result) {
            if (result.Result.split("--")[0] == sValue) {
              state = "None";
              sText = result.Result.split("--")[1];
              oInput.setValue(sValue);
            }
          });

          if (oLabel) {
            oLabel.setText(sText);
          } else if (state === "None") {
            if (sText && (NoDescript == "" || !NoDescript)) {
              oInput.setValue(sValue + " - " + sText);
            }
          }
          if (Valexi == "X") {
            oInput.setValueState(state);
          }

          if (DescriptId == "X") {
            try {
              let oComponent = oView.byId(DescriptId);
              oComponent.setValue(sText);
            } catch (error) {}
          }

          return new Promise(function (resolve, reject) {
            if (ReturnDescript == "X") {
              resolve(sText);
            } else {
              if (state === "None") {
                resolve(true);
              } else {
                resolve(false);
              }
            }
          });
        },

        oModelRead(vContext, vExpand) {
          debugger;
          let that = this;
          if (vContext[0] != "/") {
            vContext = "/" + vContext;
          }

          return new Promise(function (resolve, reject) {
            //debugger
            let oView = that.getView();
            // let oModel = oView.getModel()
            let oModel = that.getOwnerComponent().getModel();

            if (vExpand != "") {
              oModel.read(vContext, {
                urlParameters: {
                  $expand: vExpand,
                },
                success: function (oData, oResponse) {
                  //debugger
                  resolve(oData);
                },
                error: function (oError) {
                  resolve(undefined);
                },
              });
            } else {
              oModel.read(vContext, {
                success: function (oData, oResponse) {
                  //debugger
                  resolve(oData);
                },
                error: function (oError) {
                  resolve(undefined);
                },
              });
            }
          });
        },

        onCloseSearchHelpDialog: function (oEvent) {
          //debugger
          let oView = this.getView();
          let oDialog = oEvent.getSource().oParent.close();
        },

        onCreateScreen: function () {
          //debugger

          var sServiceUrl = this.getOwnerComponent().getManifestEntry(
            "/sap.app/dataSources/mainService/uri"
          );
          var oModelOptions;
          var oNewModel = new sap.ui.model.odata.v2.ODataModel(
            sServiceUrl,
            oModelOptions
          );

          let that = this;
          let oView = this.getView();
          let sViews = this.getOwnerComponent().getManifestEntry(
            "/sap.ui5/routing/viewsScreenControl"
          );
          let oConfig = oView.getModel("config").oData;

          if (oConfig.ReadFields) {
            let sViewName = "";
            let sViewId = "";

            sViews.forEach(function (viewKey) {
              sViewName = viewKey.viewName;
              sViewId = viewKey.viewId;

              let aViewOwnerComponents = that
                .getOwnerComponent()
                .byId(sViewId)
                .getControlsByFieldGroupId("");

              let aComponents = [];
              let oJsonModel = that.getView().getModel("components");
              let sNamespace = that
                .getOwnerComponent()
                .getManifestEntry("/sap.app/id");

              aViewOwnerComponents.forEach(function (sViewComponent) {
                let sField =
                  sViewComponent.sId.split("--")[
                    sViewComponent.sId.split("--").length - 1
                  ];

                if (sField.includes(":")) {
                  if (!sField.includes("-")) {
                    let oComponent = that
                      .getOwnerComponent()
                      .byId(sViewId)
                      .byId(sField);
                    let sInputtype = oComponent
                      .getMetadata()
                      .getName()
                      .split(".")
                      .pop();
                    let sDescription = oComponent.data("Description");

                    oNewModel.createEntry("/screenControlTableSet", {
                      properties: {
                        Namespace: sNamespace,
                        Viewname: sViewName,
                        Fieldname: sField,
                        Inputtype: sInputtype,
                        Description: sDescription,
                      },
                    });
                  }
                }
              });
            });

            this.onSaveScreen();
          }
        },

        onNavToHome: function () {
          let oRouter = this.getRouter();
          oRouter.navTo("home");
        },

        checkViewPermission: async function () {
          //debugger

          let oView = this.getView();
          let oRouter = this.getRouter();
          let oProfiles = oView.getModel("screenControl").oData;
          let sViewName = oView.getViewName().split("view.").pop();

          if (
            oProfiles.fields.results.find(
              (profile) =>
                profile.Active === false &&
                profile.Fieldname === "#" + sViewName
            )
          ) {
            //debugger
            oRouter.navTo("notPermission");
          }

          //debugger
        },

        screenControl: async function () {
          //debugger

          let that = this;
          let oView = this.getView();
          let oModelScreen = oView.getModel("screenControl").oData;
          let sViewName = oView.sViewName.split("view.")[1];

          return new Promise(function (resolve, reject) {
            if (oModelScreen.fields.results) {
              oModelScreen.fields.results.forEach(function (screen) {
                if (screen.Viewname == sViewName) {
                  let oField = oView.byId(screen.Fieldname);
                  if (oField) {
                    oField.setVisible(screen.Visible);
                    try {
                      oField.setEditable(screen.Visible);
                    } catch (error) {}
                  }
                }
              });
            }

            resolve(true);
          });
        },

        convertDateToISO: function (vDate) {
          //debugger;
          if (vDate) {
            let newDate;
            let Ano;
            try {
              let Dia = vDate.getUTCDate();
              let Mes = vDate.getUTCMonth() + 1;
              Ano = vDate.getUTCFullYear();

              if (Dia < 10) {
                Dia = "0" + Dia;
              }

              if (Mes < 10) {
                Mes = "0" + Mes;
              }

              if (toString(Ano).length == 2) {
                Ano = Ano + 2000;
              }

              newDate = Ano + "-" + Mes + "-" + Dia;
            } catch (error) {
              if (vDate.includes(".")) {
                vDate = vDate.replaceAll(".", "/");
              }

              let parts = vDate.split("/");

              if (parts[2].length == 2) {
                Ano = parseInt(parts[2]) + 2000;
              } else {
                Ano = parts[2];
              }

              newDate = `${Ano}-${parts[1]}-${parts[0]}`;
            }

            // // Adicionar o componente de tempo para formar uma data completa no formato ISO
            return newDate + "T00:00:00";
          } else {
            return null;
          }
        },

        onGetScreenControlFields: function (sViewName) {
          //debugger

          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();
          this.setModelHeader(oModel);

          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");
          let vContext =
            "/screenControlSet(Namespace='" +
            sNamespace +
            "',Viewname='" +
            sViewName +
            "')";

          let oProfiles = this.getModel("screenControl").oData;
          resolve(oProfiles);
        },

        onSubmitChangeModel: function (oModel) {
          let that = this;

          if (oModel.hasPendingChanges()) {
            oModel.submitChanges({
              success: function (oData, response) {
                //debugger
                oModel.refresh(true);
                let sMmessage = JSON.parse(
                  response.data.__batchResponses[0].__changeResponses[0]
                    .headers["sap-message"]
                );

                switch (sMmessage.severity) {
                  case "success":
                    that.showMessage("S", sMmessage.message);
                    break;
                  case "error":
                    that.showMessage("E", sMmessage.message);
                    break;
                  case "warning":
                    that.showMessage("W", sMmessage.message);
                    break;
                }
              },
              error: function (erro) {
                that.showMessage("E", "Erro ao salvar!");
              },
            });
          } else {
            this.showMessage("W", "Não há modificações!");
          }
        },

        GUID: function () {
          return "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx".replace(
            /[x]/g,
            function () {
              return Math.floor(Math.random() * 16)
                .toString(16)
                .toUpperCase();
            }
          );
        },

        submitChanges: function (vModel) {
          //debugger

          let oModel = vModel;
          return new Promise(function (resolve, reject) {
            // if (oModel.hasPendingChanges()) {
            oModel.submitChanges({
              success: function (oData, oResponse) {
                oModel.refresh(true);
                let oReturn = {
                  oData: oData,
                  oResponse: oResponse,
                };
                resolve(oReturn);
              },
              error: function (oError) {
                reject(oError);
              },
            });
            //}
          });
        },

        getArgument: function (inputString) {
          let match = inputString.match(/(\w+)\((.*)\)/);

          var argsObject = {};
          var argsArray = match[2].split(",");

          // Itera sobre cada argumento
          argsArray.forEach(function (arg) {
            var keyValue = arg.split("=");
            if (keyValue.length === 2) {
              var key = keyValue[0].trim();
              var value = keyValue[1].trim().replace(/^'|'$/g, "");
              argsObject[key] = value;
            }
          });

          return argsObject;
        },

        onOpenDialogAttachment: function (oEvent) {
          //debugger
          let oView = this.getView();
          let oSource = oEvent.getSource();
          let Mode = oSource.data("Mode");
          let Guid = oSource.data("Guid");

          switch (Mode) {
            case "Create":
              if (!Guid || Guid == "") {
                Guid = this.GUID();
                oSource.data("Guid", Guid);
              }
              this.onCreateAttachments(Guid);
              break;

            case "View":
              this.onViewAttachments(Guid);
              break;
          }
        },

        onCreateAttachments: function (Guid) {
          //debugger
          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();

          let mHeaders = {
            guid_attachment: Guid,
          };
          oModel.setHeaders(mHeaders);

          this.onCancelDialogAttachment();

          Fragment.load({
            id: oView.getId(),
            name: "xcop.fsc.service.view.fragments.fmCreateAttachment",
            controller: that,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);

            let oUploadCollection = oView.byId("UploadCollection");
            oUploadCollection.data("Guid", Guid);

            oDialog.open();
          });
        },

        onViewAttachments: function (Guid) {
          //debugger
          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();

          let mHeaders = {
            guid_attachment: Guid,
          };
          oModel.setHeaders(mHeaders);

          this.onCancelDialogAttachment();

          Fragment.load({
            id: oView.getId(),
            name: "xcop.fsc.service.view.fragments.fmViewAttachment",
            controller: that,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);

            let oUploadCollection = oView.byId("UploadCollection");
            oUploadCollection.data("Guid", Guid);

            oDialog.open();
          });
        },

        onBeforeUploadStarts: function (oEvent) {
          //debugger
          let that = this;
          let oView = this.getView();
          let oUploadCollection = oView.byId("UploadCollection");

          let Guid = oUploadCollection.data("Guid");
          let slugVal = oEvent.getParameter("fileName") + "," + Guid;
          let CSRFToken = this.getOwnerComponent()
            .getModel()
            .getSecurityToken();

          var oCustomerHeaderSlug = new UploadCollectionParameter({
            name: "slug",
            value: slugVal,
          });

          var oCustomerHeaderToken = new UploadCollectionParameter({
            name: "x-csrf-token",
            value: CSRFToken,
          });

          oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
          oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);
        },

        onUploadComplete: async function (oEvent) {
          //debugger

          let oView = this.getView();
          let oModel = oView.getModel();
          oModel.refresh(true);
        },

        onOpenAttachment: function (oEvent) {
          //debugger
          var oUploadCollection = this.byId("UploadCollection");
          var aSelectedItems = oUploadCollection.getSelectedItems();
          if (aSelectedItems) {
            for (var i = 0; i < aSelectedItems.length; i++) {
              oUploadCollection.downloadItem(aSelectedItems[i], true);
            }
          } else {
            MessageToast.show("Select an item to download");
          }
        },

        onRemoveAttachment: function (oEvent) {
          //debugger
          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();
          let sPath = oEvent.getParameter("item").getBindingContext().getPath();

          oModel.remove(sPath, {
            success: function (oData, oResponse) {
              //debugger
              let sMmessage = JSON.parse(oResponse.headers["sap-message"]);

              switch (sMmessage.severity) {
                case "success":
                  // that.showMessage('S', sMmessage.message)
                  break;
                case "error":
                  that.showMessage("E", sMmessage.message);
                  break;
                case "warning":
                  that.showMessage("W", sMmessage.message);
                  break;
              }
              oModel.refresh(true);
            },
            error: function (oError) {
              oModel.refresh(true);
            },
          });
        },

        onRemoveAttahments: function (oEvent) {
          //debugger
          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();

          let oUploadCollection = this.byId("UploadCollection");
          let aSelectedItems = oUploadCollection.getSelectedItems();
          let Guid = oUploadCollection.data("Guid");

          if (aSelectedItems.length > 0) {
            MessageBox.warning("Excluir itens selecionados?", {
              actions: ["Sim", "Não"],
              onClose: function (sAction) {
                if (sAction == "Sim") {
                  oUploadCollection._oList.removeSelections();

                  aSelectedItems.forEach(function (item) {
                    let sPath =
                      "/attachmentSet(Guid='" +
                      Guid +
                      "',FileGuid='" +
                      item.mProperties.documentId +
                      "')";

                    oModel.remove(sPath, {
                      success: function (oData, oResponse) {
                        //debugger
                        let sMmessage = JSON.parse(
                          oResponse.headers["sap-message"]
                        );

                        switch (sMmessage.severity) {
                          case "success":
                            break;
                          case "error":
                            break;
                          case "warning":
                            break;
                        }
                        oModel.refresh(true);
                      },
                      error: function (oError) {
                        oModel.refresh(true);
                      },
                    });
                  });
                }
              },
            });
          } else {
            this.showMessage("W", "Não há itens selecionados!");
          }

          // oModel.refresh(true)
        },

        onDownloadAttahments: async function (oEvent) {
          //debugger

          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();

          let oUploadCollection = this.byId("UploadCollection");
          let aSelectedItems = oUploadCollection.getSelectedItems();

          if (aSelectedItems.length > 0) {
            aSelectedItems.forEach(function (item) {
              oUploadCollection.downloadItem(item, true);
            });

            oUploadCollection._oList.removeSelections();
          } else {
            this.showMessage("W", "Não há itens selecionados!");
          }
        },

        onSelectAllAttachments: function (oEvent) {
          //debugger
          oEvent.oSource.oParent.oParent.selectAll();
        },

        onUnselectAllAttachments: function (oEvent) {
          //debugger
          oEvent.oSource.oParent.oParent.removeSelections();
        },

        onRenameFileAttachment: function (oEvent) {
          //debugger
          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();
          let sPath = oEvent.getParameter("item").getBindingContext().getPath();
          let sFilename = oEvent.getParameter("item").getFileName();
          let oContext = oModel.getContext(sPath);
          oModel.setProperty("Filename", sFilename, oContext);
          this.submitChanges(oModel);
        },

        formatAttribute: function (sValue) {
          if (jQuery.isNumeric(sValue)) {
            return FileSizeFormat.getInstance({
              binaryFilesize: false,
              maxFractionDigits: 1,
              maxIntegerDigits: 3,
            }).format(sValue);
          } else {
            return sValue;
          }
        },

        onCancelDialogAttachment: function () {
          if (this.byId("openDialogAttachment")) {
            this.byId("openDialogAttachment").close();
            this.byId("openDialogAttachment").destroy();
          }

          if (this.byId("openDialogViewAttachment")) {
            this.byId("openDialogViewAttachment").close();
            this.byId("openDialogViewAttachment").destroy();
          }
        },

        /*
         * ===========================================================================================
         *   Adicionado função para retirar chaves do contexto - FGC - 03/09/2024
         */
        extractKeysFromPath: function (sPath) {
          // Remove the leading slash and split the entity set name from the key section
          var sKeySection = sPath.split("(")[1].split(")")[0];

          // Split the key section into individual key-value pairs
          var aKeyValues = sKeySection.split(",");

          // Create an object to hold the key-value pairs
          var oKeys = {};

          // Iterate over each key-value pair
          aKeyValues.forEach(function (sKeyValue) {
            var aPair = sKeyValue.split("=");
            var sKey = aPair[0].trim(); // Extract the key name
            var sValue = aPair[1].trim().replace(/'/g, ""); // Extract the value and remove single quotes
            oKeys[sKey] = sValue;
          });

          return oKeys;
        },

        buildPathStringFromKeys: function (entitySetName, oKeys) {
          // Start with the entity set name and opening parenthesis
          var sContext = "/" + entitySetName + "(";

          // Get an array of key-value strings formatted as Key='Value'
          var aKeyValuePairs = Object.keys(oKeys).map(function (key) {
            return key + "='" + oKeys[key] + "'";
          });

          // Join the key-value pairs with commas and close the parenthesis
          sContext += aKeyValuePairs.join(",") + ")";

          return sContext;
        },

        /*
         * ===========================================================================================
         *   Adicionado funções adicionais - VB - 28/10/2024
         */

        onTransportRequest: function (oEvent) {
          //debugger

          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();
          let oButton = oEvent.getSource();
          let Parameter = oButton.data("Paramter");
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");
          let sToken = oModel.getSecurityToken();

          MessageBox.warning(
            "O transporte eliminará todo conteúdo do ambiente de destino \n e insere as mesmas configurações do ambiente de origem, \ndeseja executar a operação?",
            {
              actions: ["Sim", "Não"],
              onClose: function (sAction) {
                if (sAction == "Sim") {
                  let mHeaders = {
                    token: sToken,
                    namespace: sNamespace,
                  };

                  oModel.setHeaders(mHeaders);

                  oModel.callFunction("/fm_transport_FSC", {
                    method: "GET",
                    urlParameters: {
                      paramter: Parameter,
                    },
                    success: function (oData, oResponse) {
                      //debugger

                      let sResponse = oResponse.data.fm_transport_FSC;
                      that.showMessage(sResponse.Type, sResponse.Message);
                    },
                    error: function (oError) {
                      sap.m.MessageToast.show("Erro serviço SEGW!");
                    },
                  });
                }
              },
            }
          );
        },

        onHelpMe: function (oEvent) {
          //debugger
          let oButton = oEvent.getSource();
          let oView = this.getView();

          if (!this._pPopover) {
            this._pPopover = Fragment.load({
              id: oView.getId(),
              name: "xcop.wfm.manager.view.fragments.fmHelpMe",
              controller: this,
            }).then(function (oPopover) {
              oView.addDependent(oPopover);
              // oPopover.bindElement('/ProductCollection/0')
              return oPopover;
            });

            let oText = oView.byId("TextHelpMe");
            let Text =
              "O transporte de conteúdo sempre ocorrerá seguindo o fluxo de transporte:\nDEV para QAS\nQAS para PRD\nPRD para QAS e DEV simultaneamente";
            oText.setText(Text);
          }
          this._pPopover.then(function (oPopover) {
            oPopover.openBy(oButton);
          });
        },

        openFragment: function (vFragmentId, vFragment, vSecondsDelay) {
          // //debugger

          let that = this;
          let oView = this.getView();
          let sNamespace =
            this.getOwnerComponent().getManifestEntry("/sap.app/id");

          return new Promise(async function (resolve, reject) {
            if (!that.byId(vFragmentId)) {
              Fragment.load({
                id: oView.getId(),
                name: sNamespace + ".view.fragments." + vFragment,
                controller: that,
              }).then(async function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
                await that.delayInSeconds(vSecondsDelay);
                resolve(oDialog);
              });
            } else {
              that.byId(vFragmentId).destroy();

              Fragment.load({
                id: oView.getId(),
                name: sNamespace + ".view.fragments." + vFragment,
                controller: that,
              }).then(async function (oDialog) {
                oView.addDependent(oDialog);
                oDialog.open();
                await that.delayInSeconds(vSecondsDelay);
                resolve(oDialog);
              });
              //await that.delayInSeconds(vSecondsDelay);
              // resolve(oDialogId);
            }
          });
        },

        delayInSeconds: function (vSeconds) {
          return new Promise((resolve) => setTimeout(resolve, vSeconds * 1000));
        },

        encryptContext: async function (context) {
          // //debugger
          let oView = this.getView();
          let oModel = oView.getModel();
          let Token = oModel.getSecurityToken();

          if (!context) {
            throw new Error("Contexto inválido para criptografia.");
          }

          let encrypted = "";
          for (let i = 0; i < context.length; i++) {
            const charCode =
              context.charCodeAt(i) ^ Token.charCodeAt(i % Token.length);
            encrypted += String.fromCharCode(charCode);
          }

          return btoa(encrypted).replaceAll("/", "#");
        },

        decryptContext: async function (encryptedContext) {
          // //debugger

          let oView = this.getView();
          let oModel = oView.getModel();
          let Token = oModel.getSecurityToken();

          if (!encryptedContext) {
            throw new Error("Contexto inválido para descriptografia.");
          }

          encryptedContext = encryptedContext.replaceAll("#", "/");
          const decoded = atob(encryptedContext);

          let decrypted = "";
          for (let i = 0; i < decoded.length; i++) {
            const charCode =
              decoded.charCodeAt(i) ^ Token.charCodeAt(i % Token.length);
            decrypted += String.fromCharCode(charCode);
          }

          return decrypted;
        },

        showMessageReturnBAPI: function (oData, vNoMessageSuccess) {
          // //debugger

          let that = this;
          let oView = this.getView();
          let oModelMessages = oView.getModel("logMessages");

          let sTargetPos = "center center";
          sTargetPos = sTargetPos === "default" ? undefined : sTargetPos;

          oModelMessages.setData(oData.results);

          return new Promise(async function (resolve, reject) {
            const typesToCheck = ["E", "W", "I"];

            if (
              oData.results.some((item) => typesToCheck.includes(item.Type))
            ) {
              //debugger
              let oDialog = await that.openFragment(
                "DialogReturnBAPI",
                "fmMessageReturnBAPI",
                0
              );
              let TextMessage =
                "Ocorreram erros ou alertas no processamento \n\nPara visualizar o retorno das mensagens \n clique no botão LOG";
              let oTextMessage = oView.byId("TextMessage");
              oTextMessage.setText(TextMessage);

              oDialog.attachAfterClose(function () {
                this.destroy();
                resolve("");
              });
            } else {
              if (vNoMessageSuccess == "") {
                await that.showMessage("S", "Operação realizada");
              }
              resolve("S");
            }
          });
        },

        onShowMessagesBAPI: function (oEvent) {
          // //debugger

          var oLink = new Link({
            text: "Mais informações",
            href: "https://help.sap.com/docs/",
            target: "_blank",
          });

          const typeMap = {
            S: "Success",
            W: "Warning",
            I: "Information",
            E: "Error",
          };

          let that = this;
          let oView = this.getView();
          let oModelMessages = oView.getModel("logMessages");
          let oModelMockMessages = oView.getModel("mockMessages");

          let aMockMessages = [];
          let Message;
          let Type;

          oModelMessages.oData.forEach(function (message) {
            Type = typeMap[message.Type] || "Error";

            Message = {
              type: Type,
              title: message.Message,
              description: message.Number,
              subtitle: message.Id,
            };
            aMockMessages.push(Message);
          });

          oModelMockMessages.setData(aMockMessages);

          var oMessageTemplate = new MessageItem({
            type: "{type}",
            title: "{title}",
            description: "{description}",
            subtitle: "{subtitle}",
            counter: "{counter}",
            markupDescription: "{markupDescription}",
            link: oLink,
          });

          let oMessageView = new MessageView({
            showDetailsPageHeader: false,
            itemSelect: function () {
              oBackButton.setVisible(true);
            },
            items: {
              path: "/",
              template: oMessageTemplate,
            },
          });

          let oBackButton = new Button({
            icon: IconPool.getIconURI("nav-back"),
            visible: false,
            press: function () {
              oMessageView.navigateBack();
              this.setVisible(false);
            },
          });

          let oDialog = new Dialog({
            resizable: true,
            content: oMessageView,
            state: "Information",
            beginButton: new Button({
              press: function () {
                this.getParent().destroy();
              },
              text: "Fechar",
            }),
            customHeader: new Bar({
              contentLeft: [oBackButton],
              contentMiddle: [
                new Title({
                  text: "Log de mensagens",
                  level: TitleLevel.H1,
                }),
              ],
            }),
            contentHeight: "50%",
            contentWidth: "50%",
            verticalScrolling: false,
          });

          oMessageView.setModel(oModelMockMessages);
          oMessageView.navigateBack();
          oDialog.open();
        },
        onCloseDialogReturnBAPI: function (oEvent) {
          //debugger

          let oView = this.getView();
          let oDialog = oView.byId("DialogReturnBAPI");

          oDialog.close();
        },

        onRating: async function () {
          //debugger

          let that = this;
          let oView = this.getView();
          let oModel = oView.getModel();
          let BoxTable = oView.byId("BoxTable");
          let BoxForm = oView.byId("BoxForm");
          let BoxCongrat = oView.byId("BoxCongrat");

          let Rate = oView.byId("RateInd").getValue();
          let Description = oView.byId("Description").getValue();
          let Guid = this.GUID();

          oModel.createEntry("/ratingSet", {
            properties: {
              Guid: Guid,
              Rate: Rate,
              Description: Description,
            },
          });

          BoxForm.setVisible(false);
          //debugger
          let oDialog = await this.openFragment(
            "DialogBusy",
            "custom.fmBusy",
            0
          );
          let oReturn = await this.submitChanges(oModel);
          oDialog.close();

          BoxCongrat.setVisible(true);
          BoxTable.setVisible(true);
        },

        //Valter Bergamo - atualizadores de tabela 28.04.2025
        //Valter Bergamo - atualizadores de tabela 28.04.2025
        renderTable: async function (vTable) {
          debugger;

          const that = this;
          const oTable = this.byId(vTable);
          const oToolbar = oTable.getHeaderToolbar();
          const aToolbarContent = oToolbar.getContent();
          const TableAlreadyInitialized = oTable.getColumns().length > 0;

          const Operations = oTable.data("Operations").split(",");

          const Editable = Operations.includes("U");
          const Deletable = Operations.includes("D");
          const Creatable = Operations.includes("C");

          const Guid = oTable.data("Guid");

          const vContext = "objectSet('" + Guid + "')";
          const vExpand = "fields,values";

          let oObject = await this.oModelRead(vContext, vExpand);
          const aFields = oObject.fields.results;
          const aValues = oObject.values.results;

          const oHeaderField = aFields.find((field) => field.Inttype === "h");
          const sTitle = oHeaderField ? oHeaderField.ScrtextL : "Tabela";
          const aDisplayFields = aFields.filter(
            (field) => field.Inttype !== "h"
          );

          oTable.setWidth(oHeaderField.Width + "px");
          debugger;

          let oModelTable = this.getView().getModel(vTable + "Model");
          let oTemplate = null;

          if (!oModelTable) {
            this.getOwnerComponent().setModel(
              models.createBlankJSONModel(),
              vTable + "Model"
            );

            oModelTable = this.getView().getModel(vTable + "Model");

            aToolbarContent.forEach((oControl) => {
              //debugger;
              let Type = oControl.data().Type;

              switch (Type) {
                case "Insert":
                  oControl.setVisible(Creatable);
                  break;

                case "Save":
                  oControl.setVisible(Editable);
                  break;

                case "Delete":
                  oControl.setVisible(Deletable);
                  break;

                case "Title":
                  oControl.setText(sTitle);
                  break;

                default:
                  break;
              }
            });

            aDisplayFields.forEach((field) => {
              debugger;
              const sWidth = field.Width ? `${field.Width}px` : "80px";
              oTable.addColumn(
                new sap.m.Column({
                  header: new sap.m.Label({ text: field.ScrtextL }),
                  width: sWidth,
                })
              );
            });

            //Criar Template de linha
            //debugger;
            const aCells = aDisplayFields.map((field) => {
              const sPath = "{" + vTable + "Model>" + field.Fieldname + "}";
              const bEditable =
                Operations.includes("U") && field.Keyflag !== true;
              const editablePath = vTable + "Model>__New";

              debugger;
              switch (field.Inputtype) {
                case "Checkbox":
                  var oCheckox = new sap.m.CheckBox({
                    selected: sPath,
                    editable: bEditable,
                  });

                  return oCheckox;
                case "Mask":
                  //debugger
                  var oMaskInput = new sap.m.MaskInput({
                    mask: field.Mask,
                    placeholder: field.Placeholder,
                    placeholderSymbol: "_",
                    width: "95%",
                    editable: {
                      parts: [editablePath],
                      formatter: function (bIsNew) {
                        return (
                          bIsNew ||
                          (Operations.includes("U") && field.Keyflag !== true)
                        );
                      },
                    },
                    value: sPath,
                  });

                  return oMaskInput;

                case "Input":
                  var oInput = new sap.m.Input({
                    value: sPath,
                    class: "inputNoBorder",
                    editable: {
                      parts: [editablePath],
                      formatter: function (bIsNew) {
                        return (
                          bIsNew ||
                          (Operations.includes("U") && field.Keyflag !== true)
                        );
                      },
                    },
                    placeholder: field.Placeholder,
                    showSuggestion: field.Suggestion,
                    showValueHelp: field.Valuehelp,
                    width: "95%",
                  });

                  oInput.data("SuggestionTable", field.Suggestiontable); // Substitua com o valor apropriado
                  oInput.data("DataType", field.Datatype);
                  oInput.data("Mask", field.Mask);

                  oInput.data("Decimals", field.Decimals);
                  oInput.data("Sign", field.Sign);
                  oInput.data("Leng", field.Leng);

                  oInput.data("UpperCase", field.Uppercase);
                  oInput.data("Valexi", field.Valexi);
                  oInput.data("TableName", field.Tablename);
                  oInput.data("FieldName", field.Fieldname);
                  oInput.data("Filter", field.Filter);
                  oInput.data("NoZero", field.NoZero);
                  oInput.data("Fmode", field.Fmode);
                  oInput.data("Submit", field.Submit);

                  if (field.Suggestion) {
                    oInput.attachSuggest(function () {
                      that.onSuggestion(oInput, "");
                    });
                  }

                  if (field.Valuehelp) {
                    oInput.attachValueHelpRequest(function (oEvent) {
                      that.onSearchHelp(oEvent);
                    });
                  }

                  if (field.Valexi) {
                    oInput.attachChange(function (oEvent) {
                      that.onSubmitInput(oEvent);
                    });
                  }

                  return oInput;
                default:
                  return new sap.m.Text({
                    text: sPath,
                  });
              }
            });

            oTemplate = new sap.m.ColumnListItem({
              cells: aCells,
            });
          }

          // oTable.destroyColumns();
          // oTable.removeAllColumns();
          // oTable.removeAllItems();

          // Transformar estrutura por index
          const oGrouped = {};
          aValues.forEach((item) => {
            const sFieldname = item.Fieldname;
            const oFieldMeta = aFields.find((f) => f.Fieldname === sFieldname);

            let vValue = item.Value;

            // Se o tipo for Checkbox, converter para boolean
            if (oFieldMeta && oFieldMeta.Inputtype === "Checkbox") {
              vValue =
                vValue === "true" ||
                vValue === true ||
                vValue === "X" ||
                vValue === "1";
            }

            if (!oGrouped[item.Index]) {
              oGrouped[item.Index] = {};
            }

            oGrouped[item.Index][sFieldname] = vValue;
          });

          const aFinalRows = Object.values(oGrouped);

          oModelTable.setData({ rows: aFinalRows });
          oTable.setModel(oModelTable);

          oTable.bindItems({
            path: vTable + "Model>/rows",
            template: oTemplate,
          });

          oTable.data("Fields", aFields);

          //debugger;
          const aItems = oTable.getItems();

          for (const oItem of aItems) {
            const aCells = oItem.getCells();
            for (const oCell of aCells) {
              if (oCell.isA("sap.m.Input")) {
                await that.onCheckInput(oCell);
              }
            }
          }
        },

        updateModelTable: async function (vTable) {
          //debugger;

          const that = this;
          const oTable = this.byId(vTable);
          const Guid = oTable.data("Guid");
          const vContext = "objectSet('" + Guid + "')";
          const vExpand = "fields,values";

          const oObject = await this.oModelRead(vContext, vExpand);
          const aValues = oObject.values.results;
          const aFields = oObject.fields.results;

          const oGrouped = {};
          aValues.forEach((item) => {
            const sFieldname = item.Fieldname;
            const oFieldMeta = aFields.find((f) => f.Fieldname === sFieldname);
            let vValue = item.Value;

            // Se o tipo for Checkbox, converter para boolean
            if (oFieldMeta && oFieldMeta.Inputtype === "Checkbox") {
              vValue =
                vValue === "true" ||
                vValue === true ||
                vValue === "X" ||
                vValue === "1";
            }

            if (!oGrouped[item.Index]) {
              oGrouped[item.Index] = {};
            }

            oGrouped[item.Index][sFieldname] = vValue;
          });

          const aFinalRows = Object.values(oGrouped);
          let oModelTable = oTable.getModel();
          oModelTable.setData();
          oModelTable.setData({ rows: aFinalRows });

          //debugger
          const aItems = oTable.getItems();

          for (let index = 0; index < aItems.length; index++) {
            const oItem = aItems[index];

            const aCells = oItem.getCells();
            for (let index = 0; index < aCells.length; index++) {
              const oCell = aCells[index];
              if (oCell.isA("sap.m.Input")) {
                await that.onCheckInput(oCell);
              }
            }
          }
        },

        onTableSelect: function (oEvent) {
          //debugger;
          const vTable = oEvent.getSource().getSelectedKey();
          this.updateModelTable(vTable);
        },

        onAddTable: function (oEvent) {
          //debugger;

          const oTable = oEvent.getSource().getParent().getParent();
          const vTable = oTable.getId().split("--").pop();
          const oModelTable = oTable.getModel(vTable + "Model");
          const aFields = oTable.data("Fields");

          let oNewRecord = {
            __New: true,
          };

          aFields.forEach(function (field) {
            if (field.Inttype !== "h") {
              if (field.Inputtype === "Checkbox") {
                oNewRecord[field.Fieldname] = false;
              } else {
                oNewRecord[field.Fieldname] = "";
              }
            }
          });

          let aData = oModelTable.getProperty("/rows") || [];
          aData.push(oNewRecord);
          oModelTable.setProperty("/rows", aData);
        },

        onDeleteTable: function (oEvent) {
          //debugger;

          const that = this;
          const oTable = oEvent.getSource().getParent().getParent();
          const vTable = oTable.getId().split("--").pop();
          const oModelTable = oTable.getModel(vTable + "Model");
          const aRows = [];
          const Guid = oTable.data("Guid");
          const aSelectedPaths = oTable.getSelectedContextPaths();
          let oModel = this.getView().getModel();

          aSelectedPaths.forEach((sPath) => {
            aRows.push(oModelTable.getProperty(sPath));
          });

          let aFormatted = [];

          aRows.forEach((oRow, iIndex) => {
            Object.keys(oRow).forEach((sFieldname) => {
              let vValue;
              try {
                vValue = oRow[sFieldname].split(" - ")[0];
              } catch (error) {
                vValue = oRow[sFieldname];
              }

              // Se for booleano, transformar:
              if (typeof vValue === "boolean") {
                vValue = vValue ? "X" : "";
              } else {
                vValue = String(vValue);
              }

              aFormatted.push({
                Fieldname: sFieldname,
                Value: vValue,
                Index: String(iIndex),
              });
            });
          });

          let oDataFields = {
            Guid: Guid,
            values: aFormatted,
          };

          gToken = this.getView().getModel().getSecurityToken();
          gNamespace = this.getOwnerComponent().getManifestEntry("/sap.app/id");

          const mHeaders = {
            token: gToken,
            namespace: gNamespace,
            mode: "DELETE",
          };

          oModel.setHeaders(mHeaders);

          return new Promise(function (resolve, reject) {
            oModel.create("/objectSet", oDataFields, {
              success: function (oData, oHeader) {
                oModel.refresh(true);
                let oMessage = JSON.parse(oHeader.headers["sap-message"]);

                if (oMessage.severity == "success") {
                  that.showMessage("S", oMessage.message);
                  that.updateModelTable(vTable);
                  oTable.removeSelections(true);
                  resolve(true);
                } else {
                  MessageBox.error(oMessage.message, {
                    actions: ["OK"],
                    onClose: function (sAction) {
                      if (sAction == "OK") {
                        //Insert code here to handle the error
                      }
                    },
                  });
                  resolve(false);
                }
              },
              error: function (oError) {
                sap.m.MessageToast.show("Erro serviço SEGW!");
                reject(false);
              },
            });
          });
        },

        onSaveTable: function (oEvent) {
          //debugger;

          const that = this;
          const oTable = oEvent.getSource().getParent().getParent();
          const vTable = oTable.getId().split("--").pop();
          const oModelTable = oTable.getModel(vTable + "Model");
          const aRows = oModelTable.getData().rows;
          const Guid = oTable.data("Guid");
          let oModel = this.getView().getModel();

          gToken = this.getView().getModel().getSecurityToken();
          gNamespace = this.getOwnerComponent().getManifestEntry("/sap.app/id");

          const mHeaders = {
            token: gToken,
            namespace: gNamespace,
            mode: "WRITE",
          };

          oModel.setHeaders(mHeaders);

          let aFormatted = [];

          aRows.forEach((oRow, iIndex) => {
            Object.keys(oRow).forEach((sFieldname) => {
              let vValue;
              try {
                vValue = oRow[sFieldname].split(" - ")[0];
              } catch (error) {
                vValue = oRow[sFieldname];
              }

              // Se for booleano, transformar:
              if (typeof vValue === "boolean") {
                vValue = vValue ? "X" : "";
              } else {
                vValue = String(vValue);
              }

              aFormatted.push({
                Fieldname: sFieldname,
                Value: vValue,
                Index: String(iIndex),
              });
            });
          });

          let oDataFields = {
            Guid: Guid,
            values: aFormatted,
          };

          //debugger;
          return new Promise(function (resolve, reject) {
            oModel.create("/objectSet", oDataFields, {
              success: function (oData, oHeader) {
                oModel.refresh(true);
                let oMessage = JSON.parse(oHeader.headers["sap-message"]);

                if (oMessage.severity == "success") {
                  that.showMessage("S", oMessage.message);
                  that.updateModelTable(vTable);
                  oTable.removeSelections(true);
                  resolve(true);
                } else {
                  MessageBox.error(oMessage.message, {
                    actions: ["OK"],
                    onClose: function (sAction) {
                      if (sAction == "OK") {
                        //Insert code here to handle the error
                      }
                    },
                  });
                  resolve(false);
                }
              },
              error: function (oError) {
                sap.m.MessageToast.show("Erro serviço SEGW!");
                reject(false);
              },
            });
          });
        },

        oModelReadFilters(vContext, vExpand, vFilters) {
          //debugger
          let that = this;

          if (vContext[0] != "/") {
            vContext = "/" + vContext;
          }

          return new Promise(function (resolve, reject) {
            let oView = that.getView();
            let oModel = that.getOwnerComponent().getModel();

            let mParameters = {
              success: function (oData, oResponse) {
                resolve(oData);
              },
              error: function (oError) {
                resolve(undefined);
              },
            };

            if (vExpand) {
              mParameters.urlParameters = {
                $expand: vExpand,
              };
            }

            if (vFilters) {
              mParameters.filters = vFilters;
            }

            oModel.read(vContext, mParameters);
          });
        },

        toCamelCase: function (sText) {
          return sText
            .toLowerCase()
            .replace(/_+$/g, "") // remove underscores no final
            .split("_")
            .map((word, index) => {
              if (index === 0) {
                // Primeira palavra com letra maiúscula (padrão SAP camelCase)
                return word.charAt(0).toUpperCase() + word.slice(1);
              } else {
                // Outras palavras também com a primeira letra maiúscula
                return word.charAt(0).toUpperCase() + word.slice(1);
              }
            })
            .join("");
        },

        oModelCreateDeep: function (oModel, vContext, oDataFields) {
          //debugger
          let that = this;

          return new Promise(function (resolve, reject) {
            oModel.create(vContext, oDataFields, {
              success: function (oData, oHeader) {
                oModel.refresh(true);
                let oMessage = JSON.parse(oHeader.headers["sap-message"]);

                if (oMessage.severity == "success") {
                  that.showMessage("S", oMessage.message);
                  resolve(true);
                } else {
                  MessageBox.error(oMessage.message, {
                    actions: ["OK"],
                    onClose: function (sAction) {
                      if (sAction == "OK") {
                        //Insert code here to handle the error
                      }
                    },
                  });
                  resolve(false);
                }
              },
              error: function (oError) {
                sap.m.MessageToast.show("Erro serviço SEGW!");
                reject(false);
              },
            });
          });
        },

        //26.05.2025 - Incluso nvas funcionalidades - Valter Bergamo
      }
    );
  }
);
