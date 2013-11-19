
Example usage for a local log file:
```
tail -f /var/log/dash/www-requests.log | node server.js
```
Example usage for a log file on a remote server:
```
echo -n 'enter pass:'; read -s PASS; echo; ssh -t -t -t username@yourserver.com "sudo -S tail -f /var/log/nginx/access.log <<EOF
$PASS
EOF
" | node ../response-collider/server.js
```
