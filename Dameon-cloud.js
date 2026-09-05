/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");

  // How much RAM each cloud server will have. In this case, it'll be 8GB.
  const RAM = 32;
  let cloudCost = 0

  // Iterator we'll use for our loop
  let i = ns.cloud.getServerNames().length;

  // Continuously try to purchase cloud servers until we've reached the maximum
  // amount of servers
  while (i < ns.cloud.getServerLimit()) {

    const cost = ns.cloud.getServerCost(RAM)

    // Check if we have enough money to purchase access to a server
    if (ns.getServerMoneyAvailable("home") > cost) {

      ns.print(`CLOUD: Purchasing cloud-server-${i}`);

      // Purchase the server
      cloudCost += cost;
      ns.cloud.purchaseServer("cloud-server-" + i, RAM);

      // Increment our iterator to indicate that we've bought a new server
      ++i;
    }
    // Make the script wait for a second before looping again.
    // Removing this line will cause an infinite loop and crash the game.
    await ns.sleep(1000);
  }

  ns.tprint("CLOUD: Max Servers Reached");
  ns.tprint("CLOUD: Proceding to Upgrade");

  while (true) {
    const servers = ns.cloud.getServerNames();

    for (const server of servers) {
      const currentRam = ns.getServerMaxRam(server);
      const newRam = currentRam * 2;

      // Budget calculations
      const sources = ns.getMoneySources();
      const currentData = sources.sinceInstall;
      const profit = currentData.hacking - cloudCost;
      const multiplier = Math.max(0.5, 1 - ((Math.log2(currentRam) - 5) * 0.05));
      const budget = profit * multiplier;

      const cost = ns.cloud.getServerUpgradeCost(server, newRam);

      if (ns.getServerMoneyAvailable("home") > cost && budget > cost) {
        ns.print(`CLOUD: Upgrading ${server} from ${currentRam}GB → ${newRam}GB`);
        cloudCost += cost;
        ns.cloud.upgradeServer(server, newRam);

      }
    }
    await ns.sleep(1000);
  }
}
