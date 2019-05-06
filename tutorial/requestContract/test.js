const {RNode, RHOCore,  Hex, REV,Ed25519keyPair} = require("rchain-api")
const {SignDeployment} = REV
const host = 'localhost';
const port = 40401;
const rchain = RNode(require('grpc'),{host, port});

lookupNode()
function lookupNode () {
    const uri = 'rho:id:q6gqrhyzefpx93jyyr3dastd8z5ezwyrectn93ei9mccj59q7xxcrq'
    let ack = "result"
    const rholangCode = `
    new lookup(\`rho:registry:lookup\`), registerCh in {
      lookup!(\`URI\`, *registerCh)|
      for (randomNum <- registerCh){
        randomNum!(1, 5, "${ack}")
      }
    }
    `.replace("URI", uri)

    let de = {term: rholangCode,
        timestamp: new Date().valueOf(),
        phloLimit: 9999999,
        phloPrice: 1
    }
    const privateKey = "1111111111111111111111111111111111111111111111111111111111111111"
    const defaultSec = Hex.decode(privateKey)
    const deployData=SignDeployment.sign(Ed25519keyPair(defaultSec), de)

    rchain.doDeploy(deployData).then(_ => {
        return rchain.createBlock()
    }).then(_ => {
        // return rchain.listenForDataAtPublicName(ack)
        return rchain.listenForDataAtName(RHOCore.fromJSData(ack))
    }).then((blockResults) => {
        // If no data is on RChain
        console.log(blockResults)
        if(blockResults.length === 0){
            console.log("block result is null")
            return
        }
        const lastBlock = blockResults.slice(-1).pop()
        // const lastDatum = lastBlock.postBlockData.slice(-1).pop()
        for(let index = 0;index<lastBlock.postBlockData.length;index++){
            console.log("result",RHOCore.toJSData(lastBlock.postBlockData[index]))
        }


    }).catch(oops => { console.log(oops); })
}