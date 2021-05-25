#!/usr/bin/python

import os
import sys

arguments = sys.argv
print('Argument List:', arguments)

if(arguments[1] == "install"): 
    os.system('pip install ' + arguments[2])
elif(arguments[1] == "uninstall"): 
    os.system('pip uninstall -y ' + arguments[2])