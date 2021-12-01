// Import the API
const { ApiPromise, WsProvider } = require('@polkadot/api');

async function main () {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider('wss://rpc.polkadot.io');

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });
  

  console.log(`- last runtime upgrade: ${(await api.query.system.lastRuntimeUpgrade()).toString()}`);
  const blockNumber = 3899547;
  console.log(`- block hash at ${blockNumber} is ${await api.rpc.chain.getBlockHash(blockNumber)}`);
  // console.log(`runtime version: ${(await api.rpc.state.getRuntimeVersion()).toString()}`);

}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});