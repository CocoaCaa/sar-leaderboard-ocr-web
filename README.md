# sar-leaderboard-ocr-web

> Uses OCR to convert Super Animal Royale private match screenshot to numeric data

## Usage

Go to https://sar-leaderboard-ocr.bananpe.win/

## How does it work?

It turns screenshots into 64 image rows, applies a negative (inverse colour), a threshold and a scale up to make the text cleaner and adds a white background to text in black. It then masks the player's name (since some names are so cool, it is diffcult to run OCR). Finally, it will output the ranking, player's in-match ID and kills. You could use those data by the in-game command `/getplayers` (Only available to Match Host) to match player names with the data. Server-side process **is not** required, it runs on your browser only.

## Accuracy

The output data is tested to **100%** accuracy in resolution _1:1 1920x1080 size without application bar_ (which is the **screenshot requirement**). However, there could still be some factors for potentional inaccuracy, double checking the data after conversion is recommended.

## Disclaimer

[Super Animal Royale](https://animalroyale.com/) is copyrighted by [Pixile](https://pixilestudios.com/), Inc and has no affiliation with this project and site.
