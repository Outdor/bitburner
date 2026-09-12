import { getAllServers } from "lib/network.js";
import { getBestTarget } from "lib/target.js";

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");

  while (true) {
    // Calulate teh ratiom for H:G:W.
    const target = getBestTarget(ns);
    const BUFFER = 1.15
    const SCRIPTRAM = 1.75
    let servMoney = ns.getServerMoneyAvailable(target);
    let hackPart = ns.hackAnalyze(target);
    let hackMoney = servMoney * hackPart;
    let servExpec = servMoney - hackMoney;
    let growThread = Math.ceil(ns.growthAnalyze(target, (servMoney / servExpec)) * BUFFER);
    let weakThread = Math.ceil((ns.hackAnalyzeSecurity(1) + ns.growthAnalyzeSecurity(growThread)) / ns.weakenAnalyze(1) * BUFFER);
    let threadTotal = 1 + growThread + weakThread;
    let totalRAM = threadTotal * SCRIPTRAM;

    const servers = getAllServers(ns);
    for (const server of servers) {
      let homeReserve = 0;
      // Skip home and un-rooted servers.
      if (server === "home")
        homeReserve = 8;
      else if (server.includes("cloud-server-"))
        homeReserve = 0;
      else if (!server.includes("cloud-server-"))
        continue;

      const freeRAM = (ns.getServerMaxRam(server) - homeReserve) - ns.getServerUsedRam(server);

      if (freeRAM < totalRAM) {
        const batches = Math.floor(freeRAM / (SCRIPTRAM * 13));
        const h = Math.floor(batches * 1);
        const g = Math.floor(batches * 10);
        const w = Math.floor(batches * 2);
        if (h > 0)
          ns.exec("bots/hack.js", server, h, target);
        if (g > 0)
          ns.exec("bots/grow.js", server, g, target);
        if (w > 0)
          ns.exec("bots/weaken.js", server, w, target);
        continue;
      }

      const batches = Math.floor(freeRAM / totalRAM);
      const h = Math.floor(batches * 1);
      const g = Math.floor(batches * growThread);
      const w = Math.floor(batches * weakThread);
      if (h > 0)
        ns.exec("bots/hack.js", server, h, target);
      if (g > 0)
        ns.exec("bots/grow.js", server, g, target);
      if (w > 0)
        ns.exec("bots/weaken.js", server, w, target);
    }

    // Sleep to prevent crashing.
    await ns.sleep(ns.getWeakenTime(target) + 10);
  }
}
