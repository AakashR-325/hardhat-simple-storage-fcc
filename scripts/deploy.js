const { ethers, run, network } = require("hardhat")

async function main() {
    //deploying ccontract.
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    )
    console.log("Deploying , please wait ....")
    const simpleStorage = await SimpleStorageFactory.deploy()
    await simpleStorage.waitForDeployment()
    const address = await simpleStorage.getAddress()
    console.log(`Deployed contract to : ${address}`)

    //verifying contract.
    console.log("Waiting for block txes ....")
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        await simpleStorage.deploymentTransaction().wait(6)
        await verify(address, [])
    }

    //retreiving current fav number.
    const currentValue = await simpleStorage.retrieve()
    console.log(`current value is : ${currentValue}`)

    //updating fav number and retreiving it.
    const transactionResponse = await simpleStorage.store(7)
    await transactionResponse.wait(1)
    const updatedValue = await simpleStorage.retrieve()
    console.log(`updated value is : ${updatedValue}`)
}

async function verify(contractAddress, args) {
    console.log("Verifying contract ....")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified")
        } else {
            console.log(e)
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
