import Web3 from "web3";
import readLineSync from "readline-sync";
import dotenv from "dotenv";
import axios from "axios";
import BigNumber from "bignumber.js";
import { tokenPairs } from "./constants.js";
dotenv.config();
const web3 = new Web3(
  `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_PROJECT_ID}`
);
// const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
// web3.eth.accounts.wallet.add(account);
// web3.eth.defaultAccount = account.address;
let uniSwapPrice, sushiSwapPrice;
const monitorPrice = async () => {
  let selectedTokenPairIndex = readLineSync.keyInSelect(
    tokenPairs.map((tk) => tk.name),
    "Select token pair to monitor the price:"
  );
  let selectedTokenPair = tokenPairs[selectedTokenPairIndex];
  console.log("Selected token pair:", selectedTokenPair.name);
  let [uniSwapABIResponse, sushiSwapABIResponse] = await Promise.all([
    axios.get(
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${selectedTokenPair.uniSwapAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`
    ),
    axios.get(
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${selectedTokenPair.sushiSwapAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`
    ),
  ]);
  if (uniSwapABIResponse.data.status !== "1") {
    throw new Error("Failed to fetch ABI: " + uniSwapABIResponse.data.result);
  }
  if (sushiSwapABIResponse.data.status !== "1") {
    throw new Error("Failed to fetch ABI: " + sushiSwapABIResponse.data.result);
  }
  const [uniSwapABI, sushiSwapABI] = [
    JSON.parse(uniSwapABIResponse.data.result),
    JSON.parse(sushiSwapABIResponse.data.result),
  ];
  const [uniSwap, sushiSwap] = [
    new web3.eth.Contract(uniSwapABI, selectedTokenPair.uniSwapAddress),
    new web3.eth.Contract(sushiSwapABI, selectedTokenPair.sushiSwapAddress),
  ];
  let [slot0, reserves] = await Promise.all([
    uniSwap.methods.slot0().call(),
    sushiSwap.methods.getReserves().call(),
  ]);
  [uniSwapPrice, sushiSwapPrice] = [
    computeUniSwapPrice(
      slot0.sqrtPriceX96,
      selectedTokenPair.token0Decimals,
      selectedTokenPair.token1Decimals
    ),
    computeSushiSwapPrice(
      reserves,
      selectedTokenPair.token0Decimals,
      selectedTokenPair.token1Decimals
    ),
  ];
  checkArbitrageOpportunity();
  uniSwap.events.Swap({ fromBlock: "latest" }).on("data", async () => {
    let slot0 = await uniSwap.methods.slot0().call();
    uniSwapPrice = computeUniSwapPrice(
      slot0.sqrtPriceX96,
      selectedTokenPair.token0Decimals,
      selectedTokenPair.token1Decimals
    );
    checkArbitrageOpportunity();
    console.log(
      `${selectedTokenPair.token0} : ${selectedTokenPair.token1} in Uniswap is ${uniSwapPrice}`
    );
  });
  sushiSwap.events.Swap({ fromBlock: "latest" }).on("data", async () => {
    let reserves = await sushiSwap.methods.getReserves().call();
    sushiSwapPrice = computeSushiSwapPrice(
      reserves,
      selectedTokenPair.token0Decimals,
      selectedTokenPair.token1Decimals
    );
    checkArbitrageOpportunity();
    console.log(
      `${selectedTokenPair.token0} : ${selectedTokenPair.token1} in Sushi-Swap is ${sushiSwapPrice}`
    );
  });
};
const checkArbitrageOpportunity = async () => {
  let targetProfitPercentage = 2;
  if (uniSwapPrice && sushiSwapPrice) {
    if (uniSwapPrice < sushiSwapPrice) {
      let priceDiffPercentage =
        ((sushiSwapPrice - uniSwapPrice) / uniSwapPrice) * 100;
      console.log("priceDiffPercentage on low uniswap: ", priceDiffPercentage);
      if (priceDiffPercentage >= targetProfitPercentage) {
        console.log(
          "priceDiffPercentage on low uniswap: ",
          priceDiffPercentage
        );
      }
    } else if (uniSwapPrice > sushiSwapPrice) {
      let priceDiffPercentage =
        ((uniSwapPrice - sushiSwapPrice) / sushiSwapPrice) * 100;
      console.log("priceDiffPercentage on low uniswap: ", priceDiffPercentage);
      if (priceDiffPercentage >= targetProfitPercentage) {
        console.log(
          "priceDiffPercentage on low uniswap: ",
          priceDiffPercentage
        );
      }
    }
    // const threshold = 0.5;
    // if (uniSwapPrice > sushiSwapPrice + threshold) {
    //   console.log(
    //     "Arbitrage opportunity detected! Buy on SushiSwap, sell on Uniswap."
    //   );
    // } else if (sushiSwapPrice > uniSwapPrice + threshold) {
    //   console.log(
    //     "Arbitrage opportunity detected! Buy on Uniswap, sell on SushiSwap."
    //   );
    // }
  }
};
const computeUniSwapPrice = (sqrtPriceX96, decimal0, decimal1) => {
  const Q96 = new BigNumber(2).pow(96);
  const sqrtPriceX96Big = new BigNumber(sqrtPriceX96);
  const priceRatioBig = sqrtPriceX96Big.pow(2).div(Q96.pow(2));
  const decimalDifference = new BigNumber(decimal1).minus(decimal0);
  return priceRatioBig.div(new BigNumber(10).pow(decimalDifference));
};
const computeSushiSwapPrice = (reserves, decimal0, decimal1) => {
  const reserve0Big = new BigNumber(reserves._reserve0);
  const reserve1Big = new BigNumber(reserves._reserve1);
  const decimal0Big = new BigNumber(decimal0);
  const decimal1Big = new BigNumber(decimal1);
  const adjustedReserve0 = reserve0Big.times(
    new BigNumber(10).pow(decimal1Big)
  );
  const adjustedReserve1 = reserve1Big.times(
    new BigNumber(10).pow(decimal0Big)
  );
  const priceRatio = adjustedReserve1.div(adjustedReserve0);
  return priceRatio;
};
monitorPrice();
