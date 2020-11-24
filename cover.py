#!/usr/bin/python3

import base64
import time
import os
import sys


if len(sys.argv) <= 1 or not sys.argv[1].lower().endswith('.png'):
    print('커버 png 파일을 안 줘서 그냥 종료함 ㅂ');
    time.sleep(1);
    sys.exit();

with open(sys.argv[1], 'rb') as f:
    s = f.read()

with open(os.path.join('res', 'cover.js'), 'w') as f:
    col = f.write('img_b64 = \'')
    for c in base64.b64encode(s).decode():
        col += f.write(c)
        if col > 60:
            f.write('\'\n+\'')
            col = 0
    f.write('\';\n\n')

    f.write(
            'bytes = atob(img_b64);\n'+
            'byteNumbers = new Array(bytes.length);\n'+
            'for(var i = 0; i < byteNumbers.length; i++) {\n'+
            '    byteNumbers[i] = bytes.charCodeAt(i);\n}\n'+
            'img_blob = new Blob([new Uint8Array(byteNumbers)],\n'+
            '                    {type: \'image/png\'});');
