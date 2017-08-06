echo Encoding wave from text
echo \"$1\" | text2wave -o output.wav
echo \"$1\"
echo DONE
echo Encoding wave to opus
ffmpeg -i output.wav output.opus
echo DONE
rm output.wav
