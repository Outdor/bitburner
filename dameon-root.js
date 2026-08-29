import { getAllServers } from "lib/network.js";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  const tools = [
    ["BruteSSH.exe", ns.brutessh],
    ["FTPCrack.exe", ns.ftpcrack],
    ["relaySMTP.exe", ns.relaysmtp],
    ["HTTPWorm.exe", ns.httpworm],
    ["SQLInject.exe", ns.sqlinject]
  ];

  while (true) {
    const servers = getAllServers(ns);

    for (const server of servers) {
      if (ns.hasRootAccess(server)) {
        continue;
      }

      let ports = 0;

      for (const [file, fn] of tools) {
        if (ns.fileExists(file, "home")) {
          fn(server);
          ports++;
        }
      }

      if (ports >= ns.getServerNumPortsRequired(server)) {
        try {
          ns.nuke(server);
        }
        catch { }
      }
    }

    const allRooted = servers.every(s => ns.hasRootAccess(s));

    if (allRooted) {
      ns.tprint("ROOT: All servers rooted.");
      return;
    }

    await ns.sleep(5000);
  }
}
