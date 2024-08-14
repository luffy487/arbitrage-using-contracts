const tokenPairs = [
  // {
  //   name: "USDC/WETH - 0.5%",
  //   token0: "USDC",
  //   token1: "WETH",
  //   uniSwapAddress: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
    
  // },
  {
    name: "USDC/ETH - 0.03%",
    token0: "USDC",
    token1: "WETH",
    token0Decimals : 6,
    token1Decimals : 18,
    uniSwapAddress: "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8",
    sushiSwapAddress : "0x397ff1542f962076d0bfe58ea045ffa2d347aca0"
  },
  {
    name: "USDC/USDT - 0.01%",
    token0: "USDC",
    token1: "USDT",
    token0Decimals : 6,
    token1Decimals : 6,
    uniSwapAddress: "0x3416cF6C708Da44DB2624D63ea0AAef7113527C6",
    sushiSwapAddress : "0xae5aa896bb93f4c7c5660b7fc894b3892255d015"
  },
  // {
  //   name: "WETH/USDT - 0.03%",
  //   token0: "WETH",
  //   token1: "USDT",
  //   address: "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36",
  // },
  {
    name: "UNI/WETH - 0.3%",
    token0: "UNI",
    token1: "WETH",
    token0Decimals : 18,
    token1Decimals : 18,
    uniSwapAddress: "0x1d42064Fc4Beb5F8aAF85F4617AE8b3b5B8Bd801",
    sushiSwapAddress : "0xdafd66636e2561b0284edde37e42d192f2844d40"
  },
];
export { tokenPairs };
