#!/usr/bin/python
import os
import sys

arguments = sys.argv
print('Argument List:', arguments[1] + " " +  arguments[2])

for filename in os.listdir(arguments[1]):
    #ffmpeg -i "Imagine Dragons - It's Time.mp3" "Imagine Dragons - It's Time.ogg"
    os.system('ffmpeg  -i ' + "\"" +  arguments[1] + "\\"+ filename + "\"" + " " + "\""+ arguments[1] + "\\"+ filename.split(".")[0]+arguments[2] + "\"")
    print("\"" +  arguments[1] + "\\"+ filename + "\"" + " " + "\""+ arguments[1] + "\\"+ filename.split(".")[0]+arguments[2] + "\"")
    if not arguments[2] in filename: 
        os.system("del " +  arguments[1] + "\\"+ filename)