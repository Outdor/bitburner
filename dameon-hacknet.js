/** @param {NS} ns **/
export async function main(ns) {
  ns.disableLog("ALL");

  // Number of hacknet nodes desired.
  let target = 4
  const TARGET = 24;

  // Verified 3.0 formulas
  const LEVELMULTI = lvl => 1.5 * lvl;
  const RAMMULTI = ram => 1.035 ** ((ram * 2) - 1);
  const COREMULTI = cores => (cores + 6) / 6;
  const PROFIT = (lvl, ram, cores) => LEVELMULTI(lvl) * RAMMULTI(ram) * COREMULTI(cores);

  // The Loop
  while (true) {
    const options = [];

    // Option 1: Buy new node
    const nodeCost = ns.hacknet.getPurchaseNodeCost();
    const nodeGain = PROFIT(1, 1, 1);
    options.push({
      type: "node",
      cost: nodeCost,
      gain: nodeGain,
      roi: nodeCost / nodeGain
    });

    // Gather stats for parallel leveling enforcement
    const count = ns.hacknet.numNodes();
    await ns.sleep(10);
    const statsList = [];
    for (let i = 0; i < count; i++)
      statsList.push(ns.hacknet.getNodeStats(i));
    const minLevel = Math.min(...statsList.map(s => s.level));
    const minRam = Math.min(...statsList.map(s => s.ram));
    const minCores = Math.min(...statsList.map(s => s.cores));

    // Option 2–4: Upgrade existing nodes
    for (let i = 0; i < count; i++) {
      const s = statsList[i];

      // LEVEL — only upgrade nodes at minimum level
      if (s.level === minLevel && s.level < 200) {
        const cost = ns.hacknet.getLevelUpgradeCost(i, 1);
        const gain = PROFIT(s.level + 1, s.ram, s.cores) -
          PROFIT(s.level, s.ram, s.cores);
        options.push({ type: "level", node: i, cost, gain, roi: cost / gain });
      }

      // RAM — only upgrade nodes at minimum RAM
      if (s.ram === minRam && s.ram < 64) {
        const cost = ns.hacknet.getRamUpgradeCost(i, 1);
        const gain = PROFIT(s.level, s.ram * 2, s.cores) -
          PROFIT(s.level, s.ram, s.cores);
        options.push({ type: "ram", node: i, cost, gain, roi: cost / gain });
      }

      // CORES — only upgrade nodes at minimum cores
      if (s.cores === minCores && s.cores < 16) {
        const cost = ns.hacknet.getCoreUpgradeCost(i, 1);
        const gain = PROFIT(s.level, s.ram, s.cores + 1) -
          PROFIT(s.level, s.ram, s.cores);
        options.push({ type: "core", node: i, cost, gain, roi: cost / gain });
      }
    }

    // Pick best ROI
    let best = options[0];
    for (const opt of options)
      if (opt.roi < best.roi)
        best = opt;

    // Determin the curent server limit.
    if (ns.fileExists("SQLInject.exe", "home")) {
      target = 24;
    }
    else if (ns.fileExists("HTTPWorm.exe", "home")) {
      target = 20;
    }
    else if (ns.fileExists("relaySMTP.exe", "home")) {
      target = 16;
    }
    else if (ns.fileExists("FTPCrack.exe", "home")) {
      target = 12;
    }
    else if (ns.fileExists("BruteSSH.exe", "home")) {
      target = 8;
      ns.print("Node Limit: " + target)
    }


    // Budget calculations
    const sources = ns.getMoneySources();
    const currentData = sources.sinceInstall;
    const profit = currentData.hacknet - currentData.hacknet_expenses;
    const multiplier = 1 - ((ns.hacknet.numNodes() - 1) * .04)
    const budget = profit * multiplier;

    // Try to buy it
    if (budget >= best.cost) {
      if (best.type === "node") {
        if ((ns.hacknet.numNodes() + 1) <= target) {
          ns.hacknet.purchaseNode();
          ns.print(`Bought node`);
        }
        else if ((ns.hacknet.numNodes() + 1) >= TARGET) {
          ns.tprint("HACKNET: Hacknet Complete.");
          ns.exit();
        }
      }
      if (best.type === "level") {
        ns.hacknet.upgradeLevel(best.node, 1);
        ns.print(`Node ${best.node}: +1 level`);
      }
      if (best.type === "ram") {
        ns.hacknet.upgradeRam(best.node, 1);
        ns.print(`Node ${best.node}: RAM doubled`);
      }
      if (best.type === "core") {
        ns.hacknet.upgradeCore(best.node, 1);
        ns.print(`Node ${best.node}: +1 core`);
      }
    }
    await ns.sleep(1000);
  }
}
