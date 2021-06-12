import subprocess

import os
import sys

arguments = sys.argv

subprocess.call([arguments[1]])
os.remove(arguments[1])