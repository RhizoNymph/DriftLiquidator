# DriftLiquidator

To run this, use envsample to create .env with your rpc address and bot private key (THIS SHOULD BE A KEY EXCLUSIVELY FOR THIS BOT)

Then run ./setup.sh to install depdendencies (having issues with docker networking but will make a branch with that to try and figure it out)

Then run ./start.sh to run the bot.

The script also runs a rate limiting forward proxy but solana web3.js doesn't obey https_proxy environment variable.

I tried ProxyChains (which has a commented out line in start.sh) but the handshake upon reaching the rpc server fails.

I'm guessing these problems are both stemming from ssl issues and will attempt to (and would welcome help with) getting one of the proxy solutions working to 

be able to rate limit requests to the rpc node. In the meantime, Genesysgo has excellent non rate limited nodes but I would ask that you only run the bot

without rate limiting when there's volatility so as to not put undue stress on their cluster.

Additonal rate controls come from the environment variables LIQUIDATION_DELAY and USER_delay which refer to the delay between checking if a user is liquidatable

and the delay to check for new users that have opened drift accounts. Both are stated in ms.
