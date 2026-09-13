/** @param {NS} ns */
export async function main(ns) {
    const sources = ns.getMoneySources();
    const currentData = sources.sinceInstall;
    ns.tprint("Hacking income: " + ns.format.number(currentData.hacking));
    ns.tprint("Hacknet income: " + ns.format.number(currentData.hacknet));
    ns.tprint("Crime income: " + ns.format.number(currentData.crime));
    ns.tprint("Hacknet expense: " + ns.format.number(currentData.hacknet_expenses));
}
