// Import the API
const { ApiPromise, WsProvider } = require("@polkadot/api");

async function main() {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider("wss://rpc.polkadot.io");

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });
  const specVersion = (await api.query.system.lastRuntimeUpgrade()).toString();
  let blockNumber = 3899547;
  // first hit according to https://gist.github.com/emielvanderhoek/0a6cf51393e8d22de364b777f98cd453
  blockNumber = 3911406;
  // blockNumber = 4353551;
  const endingBlockNumber = 8591976;

  while (blockNumber < endingBlockNumber) {
    let blockHash = await api.rpc.chain.getBlockHash(blockNumber);
    console.log(`- block number: ${blockNumber}`);
    let signedBlock = await api.rpc.chain.getBlock(blockHash);

    signedBlock.block.extrinsics.forEach(async (extrinsic) => {
      // TODO: Tweak to find call index of elections.vote and elections.removeVoter
      if (
        (extrinsic.callIndex[0] == 17 && extrinsic.callIndex[1] == 1) ||
        (extrinsic.callIndex[0] == 17 && extrinsic.callIndex[1] == 0)
      ) {
        // Get sender address
        const sender = extrinsic.signer.toString();
        const reserves = await api.query.balances.reserves(sender);
        const version = await api.query.balances.storageVersion();
        // console.log(reserves);
        console.log(version.registry);
      }
    });
    blockNumber++;
  }
  // console.log(`runtime version: ${(await api.rpc.state.getRuntimeVersion()).toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
