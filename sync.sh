#!/bin/bash
rsync -arv /home/timothy/Git/tcss-func/deploy/* ka476@shell.srcf.net:~/tcss/public_html/
rsync -arv /home/timothy/Git/tcss-func/src/php/config.deploy.live.php ka476@shell.srcf.net:~/tcss/public_html/php/config.deploy.php
