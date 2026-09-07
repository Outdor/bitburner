import { getAllServers } from "lib/network.js";

/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");
  const SCRIPTRAM = 1.75

  const servers = getAllServers(ns);
  for (const target of servers) {

    // Skip home and un-rooted servers.
    if (target === "home")
      continue;
    if (target.includes("cloud-server-"))
      continue;

    while ((ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) || (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target))) {
      for (const server of servers) {

        // Skip home and un-rooted servers.
        if (server === "home")
          continue;
        if (server.includes("cloud-server-"))
          continue;
        if (!ns.hasRootAccess(server))
          continue;

        let freeRAM = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
        let threads = freeRAM / SCRIPTRAM;
        if (threads > 4) {
          let growThread = Math.floor(threads * .75);
          let weakThread = Math.floor(threads * .25);
          ns.exec("bots/grow.js", server, growThread, target);
          ns.exec("bots/weaken.js", server, weakThread, target);
        }
      }
      // Sleep to prevent crashing.
      await ns.sleep(ns.getWeakenTime(target));
    }
    ns.tprint("PREP COMPLETE: " + target)
  }
}
