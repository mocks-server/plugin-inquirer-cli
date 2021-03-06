/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const chalk = require("chalk");

const CoreMocks = require("../Core.mocks.js");
const InquirerMocks = require("./Inquirer.mocks.js");

const Cli = require("../../../src/Cli");

describe("Cli", () => {
  let sandbox;
  let inquirerMocks;
  let coreMocks;
  let coreInstance;
  let cli;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    inquirerMocks = new InquirerMocks();
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    cli = new Cli(coreInstance);
    expect.assertions(1);
    coreInstance.settings.get.withArgs("cli").returns(true);
    coreInstance.settings.get.withArgs("log").returns("info");
    await cli.init();
  });

  afterEach(() => {
    sandbox.restore();
    inquirerMocks.restore();
    coreMocks.restore();
  });

  describe("when created", () => {
    it("should have added cli custom setting to core", () => {
      coreMocks.reset();
      cli = new Cli(coreInstance);
      expect(coreInstance.addSetting.getCall(0).args[0].name).toEqual("cli");
    });

    it("should have displayName", () => {
      expect(cli.displayName).toEqual("@mocks-server/plugin-inquirer-cli");
    });
  });

  describe("when initializated", () => {
    it("should call to create an inquirer", () => {
      expect(inquirerMocks.stubs.Inquirer.callCount).toEqual(1);
    });

    it("not be initializated if cli setting is disabled", async () => {
      inquirerMocks.reset();
      coreInstance.settings.get.withArgs("cli").returns(false);
      cli = new Cli(coreInstance);
      await cli.init();
      expect(inquirerMocks.stubs.Inquirer.callCount).toEqual(0);
    });

    it("should listen to settings change", async () => {
      expect(coreInstance.onChangeSettings.callCount).toEqual(1);
    });
  });

  describe("when settings are changed", () => {
    beforeEach(async () => {
      await cli.start();
    });

    it("should start cli when core cli setting is true and cli was not started", async () => {
      expect.assertions(2);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        cli: true,
      });
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(0).args[0]).toEqual("main");
    });

    it("should refresh main menu when behavior option is changed and current screen is main menu", async () => {
      expect.assertions(2);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        behavior: "foo",
      });
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should refresh main menu when delay option is changed and current screen is main menu", async () => {
      expect.assertions(2);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        delay: "foo",
      });
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should refresh main menu when host option is changed and current screen is main menu", async () => {
      expect.assertions(2);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        host: "foo",
      });
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should refresh main menu when log option is changed and current screen is main menu", async () => {
      expect.assertions(2);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        log: "foo",
      });
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should refresh main menu when watch option is changed and current screen is main menu", async () => {
      expect.assertions(2);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        watch: false,
      });
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should do nothing when a not recognized option is changed", async () => {
      coreInstance.onChangeSettings.getCall(0).args[0]({
        foo: false,
      });
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
    });

    it("should not display main menu when core settings are changed and current screen is not main menu", async () => {
      cli._currentScreen = "FOO";
      coreInstance.onChangeSettings.getCall(0).args[0]({
        behavior: "foo",
      });
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
    });

    it("should start cli if it was not started and cli option is true", async () => {
      await cli.stop();
      inquirerMocks.reset();
      expect.assertions(2);
      coreInstance.settings.get.withArgs("cli").returns(true);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        cli: true,
      });
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(0).args[0]).toEqual("main");
    });

    it("should not start cli if it was not started and cli option is false", async () => {
      await cli.stop();
      inquirerMocks.reset();
      coreInstance.settings.get.withArgs("cli").returns(false);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        cli: false,
      });
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(0);
    });

    it("should stop cli if it was started and cli option is false", async () => {
      inquirerMocks.reset();
      coreInstance.settings.get.withArgs("cli").returns(false);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        cli: false,
      });
      expect(inquirerMocks.stubs.inquirer.clearScreen.getCall(0).args[0]).toEqual({
        header: false,
      });
    });

    it("should silent traces again if log setting changes and cli is not in logs mode", async () => {
      coreInstance.settings.set.reset();
      expect.assertions(3);
      cli._isOverwritingLogLevel = false;
      coreInstance.onChangeSettings.getCall(0).args[0]({
        log: "debug",
      });
      expect(cli._logLevel).toEqual("debug");
      expect(coreInstance.settings.set.getCall(0).args[0]).toEqual("log");
      expect(coreInstance.settings.set.getCall(0).args[1]).toEqual("silent");
    });

    it("should not silent traces if log setting changes and cli is in logs mode", async () => {
      coreInstance.settings.set.reset();
      cli._isOverwritingLogLevel = false;
      cli._currentScreen = "logs";
      coreInstance.onChangeSettings.getCall(0).args[0]({
        log: "debug",
      });
      expect(coreInstance.settings.set.callCount).toEqual(0);
    });

    it("should ignore changes in log level dispatched by his own silentTraces method", async () => {
      cli._silentTraces();
      coreInstance.settings.set.reset();
      coreInstance.onChangeSettings.getCall(0).args[0]({
        log: "silent",
      });
      expect(coreInstance.settings.set.callCount).toEqual(0);
    });
  });

  describe("when alerts are changed", () => {
    beforeEach(async () => {
      await cli.start();
    });

    it("should refresh main menu", async () => {
      expect.assertions(2);
      coreInstance.onChangeAlerts.getCall(0).args[0]();
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });
  });

  describe("when started", () => {
    beforeEach(async () => {
      await cli.start();
    });

    it("should save current log level", () => {
      expect(cli._logLevel).toEqual("info");
    });

    it("should init if it has not been inited before", async () => {
      inquirerMocks.reset();
      cli = new Cli(coreInstance);
      coreInstance.settings.get.withArgs("cli").returns(true);
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
    });

    it("should do nothing if cli is disabled", async () => {
      inquirerMocks.reset();
      cli = new Cli(coreInstance);
      coreInstance.settings.get.withArgs("cli").returns(false);
      await cli.init();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(0);
    });

    it("should silent core tracer", () => {
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["log", "silent"]);
    });

    it("should display inquirer", () => {
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
    });
  });

  describe("when stopped", () => {
    let removeChangeMocksSpy;
    let removeChangeAlertsSpy;
    let removeChangeSettingsSpy;

    beforeEach(async () => {
      removeChangeMocksSpy = sinon.spy();
      removeChangeAlertsSpy = sinon.spy();
      removeChangeSettingsSpy = sinon.spy();
      coreInstance.onChangeSettings.returns(removeChangeSettingsSpy);
      coreInstance.onChangeAlerts.returns(removeChangeAlertsSpy);
      coreInstance.onChangeMocks.returns(removeChangeMocksSpy);
      await cli.start();
    });

    it("should clear screen", async () => {
      inquirerMocks.reset();
      await cli.stop();
      expect(inquirerMocks.stubs.inquirer.clearScreen.getCall(0).args[0]).toEqual({
        header: false,
      });
    });

    it("should remove onChange listeners", async () => {
      expect.assertions(3);
      inquirerMocks.reset();
      await cli.stop();
      expect(removeChangeMocksSpy.callCount).toEqual(1);
      expect(removeChangeAlertsSpy.callCount).toEqual(1);
      // it still hast to listen to change settings to restart the plugin in case cli setting changes
      expect(removeChangeSettingsSpy.callCount).toEqual(0);
    });

    it("should not stop if it was already stopped", async () => {
      await cli.stop();
      await cli.stop();
      await cli.stop();
      await cli.stop();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(2);
    });
  });

  describe('when user selects "Change current behavior"', () => {
    const fooSelectedBehavior = "foo behavior";
    let originalIds;

    beforeEach(() => {
      originalIds = coreInstance.behaviors.ids;
      coreInstance.behaviors.ids = ["foo-behavior"];
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("behavior");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooSelectedBehavior);
    });

    afterEach(() => {
      coreInstance.behaviors.ids = originalIds;
    });

    it("should call to clear screen", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(3);
    });

    it("should display main menu if there are not behaviors", async () => {
      coreInstance.behaviors.ids = [];
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should call to display behavior menu", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("behavior");
    });

    it("should set current selected behavior", async () => {
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["behavior", fooSelectedBehavior]);
    });

    it("should not filter current behaviors if there is no input", async () => {
      const fooBehaviorsNames = ["foo1", "foo2"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns(null);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.behaviors.ids = fooBehaviorsNames;
      await cli._changeCurrentBehavior();
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["behavior", fooBehaviorsNames]);
    });

    it("should not filter current features if current input is empty", async () => {
      const fooBehaviorsNames = ["foo1", "foo2"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns([]);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.behaviors.ids = fooBehaviorsNames;
      await cli._changeCurrentBehavior();
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["behavior", fooBehaviorsNames]);
    });

    it("should filter current behaviors and returns all that includes current input", async () => {
      const fooBehaviorsNames = ["foo1", "foo2", "not-included"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns("foo");
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.behaviors.ids = fooBehaviorsNames;
      await cli._changeCurrentBehavior();
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["behavior", ["foo1", "foo2"]]);
    });
  });

  describe('when user selects "Change current mock"', () => {
    const fooSelectedMock = "foo mock";
    let originalIds;

    beforeEach(() => {
      originalIds = coreInstance.mocks.ids;
      coreInstance.mocks.ids = ["foo-mock"];
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("mock");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooSelectedMock);
    });

    afterEach(() => {
      coreInstance.mocks.ids = originalIds;
    });

    it("should call to clear screen", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(3);
    });

    it("should display main menu if there are no mocks", async () => {
      coreInstance.mocks.ids = [];
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should call to display mock menu", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("mock");
    });

    it("should set current selected mock", async () => {
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["mock", fooSelectedMock]);
    });

    it("should not filter current mocks if there is no input", async () => {
      const fooMocks = ["foo1", "foo2"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns(null);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mocks.ids = fooMocks;
      await cli._changeCurrentMock();
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["mock", ["foo1", "foo2"]]);
    });

    it("should not filter current mocks if current input is empty", async () => {
      const fooMocks = ["foo1", "foo2"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns([]);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mocks.ids = fooMocks;
      await cli._changeCurrentMock();
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["mock", ["foo1", "foo2"]]);
    });

    it("should filter current mocks and returns all that includes current input", async () => {
      const fooMocks = ["foo1", "foo2", "not-included"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns("foo");
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mocks.ids = fooMocks;
      await cli._changeCurrentMock();
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["mock", ["foo1", "foo2"]]);
    });
  });

  describe('when user selects "Change route variant"', () => {
    const fooSelectedVariant = "foo variant";
    let originalVariants;

    beforeEach(() => {
      originalVariants = coreInstance.mocks.plainRoutesVariants;
      coreInstance.mocks.plainRoutesVariants = [{ id: "foo-variant" }];
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("variant");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooSelectedVariant);
    });

    afterEach(() => {
      coreInstance.mocks.plainRoutesVariants = originalVariants;
    });

    it("should call to clear screen", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(3);
    });

    it("should display main menu if there are no routes variants", async () => {
      coreInstance.mocks.plainRoutesVariants = [];
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should call to display routes variants menu", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("variant");
    });

    it("should set current selected route variant", async () => {
      await cli.start();
      expect(coreInstance.mocks.useRouteVariant.getCall(0).args).toEqual([fooSelectedVariant]);
    });

    it("should not filter current routes variants if there is no input", async () => {
      const fooVariants = [{ id: "foo1" }, { id: "foo2" }];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns(null);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mocks.plainRoutesVariants = fooVariants;
      await cli._changeRouteVariant();
      expect(coreInstance.mocks.useRouteVariant.getCall(0).args).toEqual([["foo1", "foo2"]]);
    });

    it("should not filter current routes variants if current input is empty", async () => {
      const fooVariants = [{ id: "foo1" }, { id: "foo2" }];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns([]);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mocks.plainRoutesVariants = fooVariants;
      await cli._changeRouteVariant();
      expect(coreInstance.mocks.useRouteVariant.getCall(0).args).toEqual([["foo1", "foo2"]]);
    });

    it("should filter current variants and returns all that includes current input", async () => {
      const fooVariants = [{ id: "foo1" }, { id: "foo2" }, { id: "not-included" }];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns("foo");
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mocks.plainRoutesVariants = fooVariants;
      await cli._changeRouteVariant();
      expect(coreInstance.mocks.useRouteVariant.getCall(0).args).toEqual([["foo1", "foo2"]]);
    });
  });

  describe('when user selects "Change Delay"', () => {
    const fooDelay = 2000;
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("delay");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooDelay);
    });

    it("should call to clear screen", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(3);
    });

    it("should call to display delay menu", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("delay");
    });

    it("should set current selected feature", async () => {
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["delay", fooDelay]);
    });

    it("should not pass delay validation if user introduce non numeric characters", async () => {
      await cli.start();
      expect(cli._cli.questions.delay.validate(cli._cli.questions.delay.filter("asdads"))).toEqual(
        false
      );
    });

    it("should pass delay validation if user introduce numeric characters", async () => {
      await cli.start();
      expect(cli._cli.questions.delay.validate(cli._cli.questions.delay.filter("123230"))).toEqual(
        true
      );
    });
  });

  describe('when user selects "Restart server"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("restart");
    });

    it("should call to restart server", async () => {
      await cli.start();
      expect(coreInstance.restartServer.callCount).toEqual(1);
    });
  });

  describe('when user selects "restore route variants"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("restoreVariants");
    });

    it("should call to restore variants", async () => {
      await cli.start();
      expect(coreInstance.mocks.restoreRoutesVariants.callCount).toEqual(1);
    });
  });

  describe('when user selects "Change log level"', () => {
    const fooLogLevel = "foo-level";

    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("logLevel");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooLogLevel);
    });

    it("should call to display log level menu", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("logLevel");
    });

    it("should set current log level with the result of log level question", async () => {
      await cli.start();
      expect(cli._logLevel).toEqual(fooLogLevel);
    });
  });

  describe('when user selects "Switch watch"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("watch");
    });

    it("should call to switchWatch server method, passing true if it was disabled", async () => {
      coreInstance.settings.get.withArgs("watch").returns(false);
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["watch", true]);
    });

    it("should call to switchWatch server method, passing false if it was enabled", async () => {
      coreInstance.settings.get.withArgs("watch").returns(true);
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["watch", false]);
    });
  });

  describe('when user selects "Switch watch legacy"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("watchLegacy");
    });

    it("should call to switchWatchLegacy server method, passing true if it was disabled", async () => {
      coreInstance.settings.get.withArgs("watchLegacy").returns(false);
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["watchLegacy", true]);
    });

    it("should call to switchWatchLegacy server method, passing false if it was enabled", async () => {
      coreInstance.settings.get.withArgs("watchLegacy").returns(true);
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["watchLegacy", false]);
    });
  });

  describe('when user selects "Display server logs"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("logs");
    });

    it("should call to logsMode CLI method", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.logsMode.callCount).toEqual(1);
    });

    it("should call to set current log level after logs mode is enabled", async () => {
      const fooLogLevel = "foo-log-level";
      coreMocks.reset();
      cli = new Cli(coreInstance);
      coreInstance.settings.get.withArgs("cli").returns(true);
      coreInstance.settings.get.withArgs("log").returns(fooLogLevel);
      await cli.init();
      inquirerMocks.stubs.inquirer.logsMode.executeCb(true);
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["log", fooLogLevel]);
    });
  });

  describe("when printing header", () => {
    it("should print server url as first element", async () => {
      await cli.start();
      expect(cli._header()[0]).toEqual(expect.stringContaining("Mocks server listening"));
    });

    it("should print localhost as host when it is 0.0.0.0", async () => {
      coreInstance.settings.get.withArgs("host").returns("0.0.0.0");
      await cli.start();
      expect(cli._header()[0]).toEqual(expect.stringContaining("http://localhost"));
    });

    it("should print custom host as host", async () => {
      coreInstance.settings.get.withArgs("host").returns("foo-host");
      await cli.start();
      expect(cli._header()[0]).toEqual(expect.stringContaining("http://foo-host"));
    });

    it("should print delay in yellow if is greater than 0", async () => {
      coreInstance.settings.get.withArgs("delay").returns(1000);
      await cli.start();
      expect(cli._header()[1]).toEqual(expect.stringContaining(chalk.yellow("1000")));
    });

    it("should print delay in green if is equal to 0", async () => {
      coreInstance.settings.get.withArgs("delay").returns(0);
      await cli.start();
      expect(cli._header()[1]).toEqual(expect.stringContaining(chalk.green("0")));
    });

    it("should print mocks in red if are equal to 0", async () => {
      coreInstance.mocks.plainMocks = [];
      await cli.start();
      expect(cli._header()[3]).toEqual(expect.stringContaining(chalk.red("0")));
    });

    it("should print mocks in green if are greater than 0", async () => {
      coreInstance.mocks.plainMocks = [{}, {}, {}, {}];
      await cli.start();
      expect(cli._header()[3]).toEqual(expect.stringContaining(chalk.green("4")));
    });

    it("should print current mock in red if it is null", async () => {
      coreInstance.mocks.current = null;
      await cli.start();
      expect(cli._header()[2]).toEqual(expect.stringContaining(chalk.red("-")));
    });

    it("should print current mock in green if it is defined", async () => {
      coreInstance.mocks.current = "foo";
      await cli.start();
      expect(cli._header()[2]).toEqual(expect.stringContaining(chalk.green("foo")));
    });

    it("should print current mock in yellow if there are custom routes variants", async () => {
      coreInstance.mocks.current = "foo";
      coreInstance.mocks.customRoutesVariants = ["foo-variant", "foo-variant-2"];
      await cli.start();
      expect(cli._header()[2]).toEqual(
        expect.stringContaining(chalk.yellow("foo (custom variants: foo-variant,foo-variant-2)"))
      );
    });

    it("should print current routes in red if there are less than 1", async () => {
      coreInstance.mocks.plainRoutes = [];
      await cli.start();
      expect(cli._header()[4]).toEqual(expect.stringContaining(chalk.red("0")));
    });

    it("should print current routes in green if there are less than 1", async () => {
      coreInstance.mocks.plainRoutes = [{}, {}];
      await cli.start();
      expect(cli._header()[4]).toEqual(expect.stringContaining(chalk.green("2")));
    });

    it("should print current routes variants in red if there are less than 1", async () => {
      coreInstance.mocks.plainRoutesVariants = [];
      await cli.start();
      expect(cli._header()[5]).toEqual(expect.stringContaining(chalk.red("0")));
    });

    it("should print current routes in green if there are less than 1", async () => {
      coreInstance.mocks.plainRoutesVariants = [{}, {}];
      await cli.start();
      expect(cli._header()[5]).toEqual(expect.stringContaining(chalk.green("2")));
    });

    it("should print watch in yellow if it is disabled", async () => {
      coreInstance.settings.get.withArgs("watch").returns(false);
      await cli.start();
      expect(cli._header()[7]).toEqual(expect.stringContaining(chalk.yellow("false")));
    });

    it("should print watch in yellow if it is enabled", async () => {
      coreInstance.settings.get.withArgs("watch").returns(true);
      await cli.start();
      expect(cli._header()[7]).toEqual(expect.stringContaining(chalk.green("true")));
    });
  });

  describe("when printing header with legacy mode enabled", () => {
    beforeEach(() => {
      coreInstance.settings.get.withArgs("pathLegacy").returns(true);
    });

    it("should print behaviors in red if are equal to 0", async () => {
      coreInstance.behaviors.count = 0;
      await cli.start();
      expect(cli._header()[9]).toEqual(expect.stringContaining(chalk.red("0")));
    });

    it("should print behaviors in green if are greater than 0", async () => {
      coreInstance.behaviors.count = 10;
      await cli.start();
      expect(cli._header()[9]).toEqual(expect.stringContaining(chalk.green("10")));
    });

    it("should print current behavior in red if it is null", async () => {
      coreInstance.behaviors.currentId = null;
      await cli.start();
      expect(cli._header()[10]).toEqual(expect.stringContaining(chalk.red("-")));
    });

    it("should print current behavior in green if it is defined", async () => {
      coreInstance.behaviors.currentId = "foo";
      await cli.start();
      expect(cli._header()[10]).toEqual(expect.stringContaining(chalk.green("foo")));
    });

    it("should print current fixtures in red if there are less than 1", async () => {
      coreInstance.fixtures.count = 0;
      await cli.start();
      expect(cli._header()[11]).toEqual(expect.stringContaining(chalk.red("0")));
    });

    it("should print current fixtures in green if there are less than 1", async () => {
      coreInstance.fixtures.count = 10;
      await cli.start();
      expect(cli._header()[11]).toEqual(expect.stringContaining(chalk.green("10")));
    });

    it("should print watch in yellow if it is disabled", async () => {
      coreInstance.settings.get.withArgs("watchLegacy").returns(false);
      await cli.start();
      expect(cli._header()[8]).toEqual(expect.stringContaining(chalk.yellow("false")));
    });

    it("should print watch in yellow if it is enabled", async () => {
      coreInstance.settings.get.withArgs("watchLegacy").returns(true);
      await cli.start();
      expect(cli._header()[8]).toEqual(expect.stringContaining(chalk.green("true")));
    });
  });

  describe("when printing alerts", () => {
    it("should not display alerts if core alerts are empty", async () => {
      coreInstance.alerts = [];
      await cli.start();
      expect(cli._alertsHeader().length).toEqual(0);
    });

    it("should display provided alert in yellow when it has no error", async () => {
      expect.assertions(2);
      coreInstance.alerts = [
        {
          message: "foo message",
        },
      ];
      await cli.start();
      expect(cli._alertsHeader()[0]).toEqual(expect.stringContaining("Warning"));
      expect(cli._alertsHeader()[0]).toEqual(expect.stringContaining(chalk.yellow("foo message")));
    });

    it("should display provided alert in red when it has error", async () => {
      expect.assertions(2);
      coreInstance.alerts = [
        {
          message: "foo message",
          error: {
            message: "Foo error message",
            stack: "Testing stack\nTesting stack 2\nTesting stack 3\nTesting stack 4",
          },
        },
      ];
      await cli.start();
      expect(cli._alertsHeader()[0]).toEqual(expect.stringContaining("Error"));
      expect(cli._alertsHeader()[0]).toEqual(
        expect.stringContaining(
          chalk.red(
            `foo message: Foo error message\n         Testing stack\n         Testing stack 2\n         Testing stack 3...`
          )
        )
      );
    });
  });

  describe("when server emits change:mocks event", () => {
    beforeEach(async () => {
      await cli.start();
      coreInstance.onChangeMocks.getCall(0).args[0]();
    });

    it("should exit logs mode", async () => {
      expect(inquirerMocks.stubs.inquirer.exitLogsMode.callCount).toEqual(2);
    });
  });
});
