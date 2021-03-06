/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const { request, wait, TimeCounter, BINARY_PATH } = require("./support/utils");
const CliRunner = require("../../inquirer/support/CliRunner");

describe("command line arguments", () => {
  const cwdPath = path.resolve(__dirname, "fixtures");
  let cli;

  afterEach(async () => {
    await cli.kill();
  });

  describe("pathLegacy option", () => {
    it("should set mocks folder", async () => {
      expect.assertions(2);
      cli = new CliRunner([BINARY_PATH, "--pathLegacy=web-tutorial"], {
        cwd: cwdPath,
      });
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(cli.logs).toEqual(expect.stringContaining("behaviors: 3"));
    });
  });

  describe("behavior option", () => {
    describe("when not provided", () => {
      it("should set as current behavior the first one found", async () => {
        expect.assertions(2);
        cli = new CliRunner([BINARY_PATH, "--pathLegacy=web-tutorial"], {
          cwd: cwdPath,
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: standard"));
      });
    });

    describe("when provided and exists", () => {
      it("should set current behavior", async () => {
        expect.assertions(2);
        cli = new CliRunner([BINARY_PATH, "--pathLegacy=web-tutorial", "--behavior=dynamic"], {
          cwd: cwdPath,
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 2, name: "Jane Doe" });
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: dynamic"));
      });
    });

    describe("when provided and does not exist", () => {
      it("should display an alert", async () => {
        cli = new CliRunner([BINARY_PATH, "--pathLegacy=web-tutorial", "--behavior=foo"], {
          cwd: cwdPath,
        });
        await wait();
        expect(cli.currentScreen).toEqual(expect.stringContaining("ALERTS"));
        expect(cli.currentScreen).toEqual(
          expect.stringContaining('Defined behavior "foo" was not found')
        );
      });

      it("should set as current behavior the first one found", async () => {
        expect.assertions(3);
        cli = new CliRunner([BINARY_PATH, "--pathLegacy=web-tutorial", "--behavior=foo"], {
          cwd: cwdPath,
        });
        await wait();
        const users = await request("/api/users/2");
        expect(users).toEqual({ id: 1, name: "John Doe" });
        expect(cli.currentScreen).toEqual(
          expect.stringContaining("The first one found was used instead")
        );
        expect(cli.logs).toEqual(expect.stringContaining("Current behavior: standard"));
      });
    });
  });

  describe("delay option", () => {
    it("should set delay", async () => {
      expect.assertions(3);
      cli = new CliRunner([BINARY_PATH, "--pathLegacy=web-tutorial", "--delay=2000"], {
        cwd: cwdPath,
      });
      await wait();
      const timeCounter = new TimeCounter();
      const users = await request("/api/users");
      timeCounter.stop();
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      expect(cli.currentScreen).toEqual(expect.stringContaining("Delay: 2000"));
      expect(timeCounter.total).toBeGreaterThan(1999);
    });
  });

  describe("log option", () => {
    it("should set log level", async () => {
      cli = new CliRunner([BINARY_PATH, "--pathLegacy=web-tutorial", "--log=debug"], {
        cwd: cwdPath,
      });
      await wait();
      expect(cli.currentScreen).toEqual(expect.stringContaining("Log level: debug"));
    });
  });
});
