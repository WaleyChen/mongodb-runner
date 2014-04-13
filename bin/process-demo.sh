#!/usr/bin/env bash

TAG='v0.0.3';
DEMOS='~/Dropbox/mongoscope/demos';

ffmpeg -i $DEMOS/$TAG.mp4 -vf scale=640:-1 $DEMOS/$TAG-scale.mp4;
ffmpeg -i $DEMOS/$TAG-scale.mp4 -vf "setpts=0.5*PTS" $DEMOS/$TAG-speed.mp4;
gify -r 5 $DEMOS/$TAG-speed.mp4 $DEMOS/$TAG.gif;
rm $DEMOS/$TAG-scale.mp4;
rm $DEMOS/$TAG-speed.mp4;
