// Import the API
const { ApiPromise, WsProvider } = require("@polkadot/api");

async function main() {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider("wss://rpc.polkadot.io");

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });
  const specVersion = (await api.query.system.lastRuntimeUpgrade()).toString();
  // console.log(`- last runtime upgrade: ${specVersion}`);
  let blockNumber = 3899547;
  // first hit according to https://gist.github.com/emielvanderhoek/0a6cf51393e8d22de364b777f98cd453
  blockNumber = 3911406;

  while (blockNumber < 5661442) {
    let blockHash = await api.rpc.chain.getBlockHash(blockNumber);
    console.log(`- block hash at ${blockNumber} is ${blockHash}`);
    let signedBlock = await api.rpc.chain.getBlock(blockHash);

    signedBlock.block.extrinsics.forEach((ex, index) => {
      const {
        isSigned,
        meta,
        method: { args, method, section },
      } = ex;
      console.log(`index: ${index}, extrinsic: ${method}`);
      
      // console.log(`method: ${method}`);
      // console.log("meta",meta);
      if(method === "removeVoter" || method === "vote") {
        console.log(meta.toHuman());
      }
      // explicit display of name, args & documentation
      // console.log(
      //   `${section}.${method}(${args.map((a) => a.toString()).join(", ")})`
      // );
      // console.log(meta.documentation.map((d) => d.toString()).join("\n"));
    });

    blockNumber++;
  }
  // console.log(`runtime version: ${(await api.rpc.state.getRuntimeVersion()).toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
