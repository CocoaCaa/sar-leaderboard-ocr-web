# sar-leaderboard-ocr-web

> Use OCR convert Super Animal Royale private match screenshot to number data

## Usage

Go to https://sar-leaderboard-ocr.bananpe.win/

## How it is work?

It will turn the screenshots into 64 image rows, apply a negative (inverse colour), threshold and scale up to make the text more clean and black text with white background. Then masked the player name (since some name are so cool, it diffcult to do OCR). And finally, it will output the rank, player in-match ID and kills. You could use those data with the in-game `/getplayers` command (Only match Host could use) to match the player names with those data.

## Accuracy

The output data tested could up to **100%** accurate in resolution _1:1 1920x1080 size without application bar_ (and that is the **screenshot requirement**). But there could still have some reason to make the result incorrect, recommend doubling check the data one-by-one after converted.

## Disclaimer

[Super Animal Royale](https://animalroyale.com/) is copyright [Pixile](https://pixilestudios.com/), Inc and is not affiliated with this project and site.
