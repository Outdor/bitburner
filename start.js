/** @param {NS} ns */
export async function main(ns) {
  ns.nuke("n00dles");
  ns.scp(["dameons/dameon-root.js", "lib/network.js"], "n00dles", "home");
  ns.exec("dameons/dameon-root.js", "n00dles");

  ns.nuke("foodnstuff");
  ns.scp(["controllers/core-hack.js", "controllers/core-prep.js", "dameons/dameon-deploy.js", "lib/network.js", "lib/target.js"], "foodnstuff", "home");
  ns.exec("controllers/core-hack.js", "foodnstuff");
  ns.exec("controllers/core-prep.js", "foodnstuff");
  ns.exec("dameons/dameon-deploy.js", "foodnstuff");

  ns.nuke("sigma-cosmetics");
  ns.scp(["dameons/dameon-cloud.js", "dameons/dameon-hacknet.js"], "sigma-cosmetics", "home");
  ns.exec("dameons/dameon-cloud.js", "sigma-cosmetics");
  ns.exec("dameons/dameon-hacknet.js", "sigma-cosmetics");
}
