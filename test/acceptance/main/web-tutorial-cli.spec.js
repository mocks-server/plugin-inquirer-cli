/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const SCREEN_SEPARATOR = ">> Mocks server";

const path = require("path");
const { CliRunner, request, wait } = require("./utils");

describe("web tutorial", () => {
  let cli;
  const binaryPath = "../../../../bin/mocks-server";
  const cwdPath = path.resolve(__dirname, "fixtures");

  const logCurrentScreen = async () => {
    await wait(500);
    const lastLog = cli.allLogs[cli.allLogs.length - 1];
    const screen = lastLog.includes(SCREEN_SEPARATOR)
      ? `${SCREEN_SEPARATOR}${lastLog.split(SCREEN_SEPARATOR).pop()}`
      : lastLog;
    console.log("CURRENT CLI SCREEN -----------------------");
    console.log(screen);
  };

  beforeAll(async () => {
    cli = new CliRunner([binaryPath, "--behaviors=web-tutorial"], {
      cwd: cwdPath
    });
    await wait();
  });

  afterAll(async () => {
    await cli.kill();
  });

  describe("When started", () => {
    it("should have 3 behaviors available", async () => {
      expect(cli.logs).toEqual(expect.stringContaining("Behaviors: 3"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await request("/api/users/1");
      expect(users).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe('When changing current behavior to "user2"', () => {
    it("should display new selected behavior", async () => {
      console.log(await cli.newScreenAfter(cli.pressEnter));
      cli.cursorDown();
      await logCurrentScreen();
      const newScreen = await cli.newScreenAfter(cli.pressEnter);
      await logCurrentScreen();
      expect(newScreen).toEqual(expect.stringContaining("Current behavior: user2"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await request("/api/users/1");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });
  });

  describe('When changing current behavior to "dynamic"', () => {
    it("should display new selected behavior", async () => {
      console.log(await cli.newScreenAfter(cli.pressEnter));
      cli.cursorDown();
      await logCurrentScreen();
      cli.cursorDown();
      await logCurrentScreen();
      const newScreen = await cli.newScreenAfter(cli.pressEnter);
      await logCurrentScreen();
      expect(newScreen).toEqual(expect.stringContaining("Current behavior: dynamic"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await request("/api/users/1");
      expect(users).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await request("/api/users/3", {
        resolveWithFullResponse: true,
        simple: false
      });
      expect(usersResponse.statusCode).toEqual(404);
    });
  });
});
