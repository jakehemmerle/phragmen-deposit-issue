// Import the API
const { ApiPromise, WsProvider } = require("@polkadot/api");
const csv = require("@fast-csv/format");
const fs = require("fs");

async function main() {

	const PLANCK_PER_DOT = 10000000000;
	// Initialise the provider to connect to the local node
	const provider = new WsProvider("wss://rpc.polkadot.io");

	// Create the API and wait until ready
	const api = await ApiPromise.create({ provider });
	// runtime 28 startblock
	let blockNumber = 3899547;

	// first hit according to https://gist.github.com/emielvanderhoek/0a6cf51393e8d22de364b777f98cd453
	blockNumber = 3911406;
	// blockNumber = 4353551; // 200960000000
	// blockNumber = 4300648; // truncated
	blockNumber = 4204227; // start of 28
	blockNumber = 4205479; 

	const endingBlockNumber = 5661442;
	const extrinsics = {
		vote: [],
		remove_voter: [],
	};
	const stream = csv.format();
	// stream.pipe(process.stdout);

	while (blockNumber < endingBlockNumber) {
		let blockHash = await api.rpc.chain.getBlockHash(blockNumber);
		console.log(`- block number: ${blockNumber}`);
		let signedBlock = await api.rpc.chain.getBlock(blockHash);

		signedBlock.block.extrinsics.forEach(async (extrinsic) => {
			if (extrinsic.callIndex[0] == 17) { // if extrinsic is in the phragmen election pallet
				if (extrinsic.callIndex[1] == 0 || extrinsic.callIndex[1] == 1) { // `vote` or `remove_voter` extrinsics
					const sender = extrinsic.signer.toString();

					const currentBlockAPI = await api.at(blockHash);
					const prevBlockAPI = await api.rpc.chain.getBlockHash(blockNumber - 1).then(hash => api.at(hash));
					const nextBlockAPI = await api.rpc.chain.getBlockHash(blockNumber + 1).then(hash => api.at(hash));
					

					const prevReservedAmountInPallet = await prevBlockAPI.query.electionsPhragmen.voting(sender).then(senderVotingValue => senderVotingValue.deposit.toNumber() / PLANCK_PER_DOT);

					const prevReservedAmountFromRelay = await prevBlockAPI.query.system.account(sender).then(account => account.data.reserved.toNumber() / PLANCK_PER_DOT);

					const currentReservedAmountInPallet = await currentBlockAPI.query.electionsPhragmen.voting(sender).then(senderVotingValue => senderVotingValue.deposit.toNumber() / PLANCK_PER_DOT);

					const currentReservedAmountFromRelay = await currentBlockAPI.query.system.account(sender).then(account => account.data.reserved.toNumber() / PLANCK_PER_DOT);
					
					const nextReservedAmountInPallet = await nextBlockAPI.query.electionsPhragmen.voting(sender).then(senderVotingValue => senderVotingValue.deposit.toNumber() / PLANCK_PER_DOT);

					const nextReservedAmountFromRelay = await nextBlockAPI.query.system.account(sender).then(account => account.data.reserved.toNumber() / PLANCK_PER_DOT);

					// if (reservedAmountFromRelay == 0.05) {

					// }

					

					// extrinsics.push({
					// 		sender,
					// 		blockNumber,
					// });
					console.log();
				}
			}
		});
		blockNumber++;
	}
	// stream.write([data]);
	// stream.end();
}

main().catch((error) => {
	console.error(error);
	process.exit(-1);
});
