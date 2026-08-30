import { getAllServers } from "lib/network.js";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  // List of files to be copied.
  const files = ["bots/grow.js", "bots/weaken.js", "bots/hack.js"];

  while (true) {

    // Retrieve a list of all servers.
    const servers = getAllServers(ns);
    for (const server of servers) {

      // Skip unrooted servers & home server.
      if (!ns.hasRootAccess(server))
        continue;
      if (server === "home")
        continue;

      // Copy files to server.
      await ns.scp(files, server, "home");
    }

    await ns.sleep(5000); // update every 5 seconds
  }
}
