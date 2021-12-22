// Import the API
const { ApiPromise, WsProvider } = require("@polkadot/api");
const csv = require("@fast-csv/format");
const fs = require("fs");

async function main() {
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
	blockNumber = 4204227;

	const endingBlockNumber = 8591976;
	const data = {};
	const rows = [];
	const stream = csv.format();
	// stream.pipe(process.stdout);

	while (blockNumber < endingBlockNumber) {
		let blockHash = await api.rpc.chain.getBlockHash(blockNumber);
		console.log(`- block number: ${blockNumber}`);
		let signedBlock = await api.rpc.chain.getBlock(blockHash);
		if ((await api.rpc.state.getRuntimeVersion()).toString() > 31) {
			break;
		}
		signedBlock.block.extrinsics.forEach(async (extrinsic) => {
			if (extrinsic.callIndex[0] == 17) {
				// Get sender address
				const sender = extrinsic.signer.toString();
				data.sender = sender;
				data.block = blockNumber;
				// Returns a decorated API instance at the current block hash
				const apiAt = await api.at(blockHash);
				const voting = await apiAt.query.electionsPhragmen.voting(sender);
				data.votingReserve = voting.deposit.toNumber() / 10000000000;
				const account = await apiAt.query.system.account(sender);
				data.accountReserves = account.data.reserved.toNumber() / 10000000000;
				rows.push(data);
				console.log(rows);

				if (extrinsic.callIndex[1] == 0) {
					console.log("vote called");
					// if(data.votingReserve == )
				} else if (extrinsic.callIndex[1] == 1) {
					console.log("remove_voter called");
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
