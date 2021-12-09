/* eslint-disable no-undef */
// * Used in on-chain-vote-template
// Import the API
const { ApiPromise, WsProvider } = require("@polkadot/api");

const main = async () => {
  const provider = new WsProvider("wss://westend-rpc.polkadot.io");
  // const provider = new WsProvider("wss://rpc.polkadot.io");
  const api = await ApiPromise.create({ provider });
  const endingBlockNumber = 8591976;

  const results = {
    voteACount: 0,
    voteBCount: 0,
  };

  // keep track of the senders to prevent double voting
  const senderList = [];

  // starting block number to start counting votes
  let blockNumber = 8591970;
  while (blockNumber < endingBlockNumber) {
    let blockHash = await api.rpc.chain.getBlockHash(blockNumber);
    console.log(`- block number: ${blockNumber}`);
    let signedBlock = await api.rpc.chain.getBlock(blockHash);

    signedBlock.block.extrinsics.forEach((extrinsic) => {
      // This specific call index [0,1] represents `system.remarkWithEvent`
      // TODO: Tweak to find call index of elections.vote and elections.removeVoter
      if (extrinsic.callIndex[0] == 0 && extrinsic.callIndex[1] == 8) {
        // Get sender address
        const sender = extrinsic.signer.toString();
        const remark = extrinsic.args[0].toHuman();
        // Assign vote id here
        const voteNumber = -1;

        if (
          remark
            .toString()
            .startsWith(`Vote_${voteNumber.toString()}_Remark_Name_`) &&
          !senderList.includes(sender)
        ) {
          senderList.push(sender);
          console.log(sender, remark);
          if (remark.toString().endsWith("A")) {
            results.voteACount++;
          } else if (remark.toString().endsWith("B")) {
            results.voteBCount++;
          }
        }
      }
    });
    blockNumber++;
  }
  return results;
};

main()
  .then((res) =>
    console.log(`voteACount: ${res.voteACount}\nvoteBCount: ${res.voteBCount}`)
  )
  .catch(console.error)
  .finally(() => process.exit(0));
