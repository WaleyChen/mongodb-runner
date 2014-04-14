#!/usr/bin/env bash

TAG='v0.0.4-top_with_event_stream';
DEMOS='/Users/lucas/Dropbox/mongoscope/demos';

ffmpeg -i $DEMOS/$TAG.mov -vf scale=640:340 $DEMOS/$TAG-scale.mov;
ffmpeg -i $DEMOS/$TAG-scale.mov -vf "setpts=0.25*PTS" $DEMOS/$TAG-speed.mov;
gify -r 1 $DEMOS/$TAG-speed.mov $DEMOS/$TAG.gif;
rm $DEMOS/$TAG-scale.mov;
rm $DEMOS/$TAG-speed.mov;
