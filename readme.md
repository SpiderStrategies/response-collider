Response Collider
=================

Creates a simple [d3](http://d3js.org/) forced-graph displaying server traffic flowing through your system. Each bubble represents a single http request/response. The speed of the bubble
is proportional to the response time on the server, and the size of the bubble is based on the size of the response.

We pipe stdin over a websocket to the client, which builds a bubble for each data event. Use [response-emitter](https://github.com/SpiderStrategies/response-emitter) to generate some test data.


![Example bubbles](https://raw.github.com/SpiderStrategies/response-collider/master/bubbles.gif)

---
Create a logger in nginx that logs in JSON. If you're not logging in JSON format, [you should](https://journal.paul.querna.org/articles/2011/12/26/log-for-machines-in-json/).

Here's an nginx conf snippet:

```
log_format json '{'
                  '"remote_addr": "$remote_addr",'
                  '"remote_user": "$remote_user",'
                  '"time_local": "$time_local",'
                  '"request": "$request",'
                  '"status": "$status",'
                  '"server": "$upstream_addr",'
                  '"body_bytes_sent": "$body_bytes_sent",'
                  '"request_time": "$request_time",'
                  '"sent": "$bytes_sent",'
                  '"http_referer": "$http_referer",'
                  '"http_user_agent": "$http_user_agent",'
                  '"http_x_forwarded_for": "$http_x_forwarded_for"'
                '}';

  access_log  /var/log/dash/www-access.log json;
```

You can change env.json to set the mount point of this app and regenerate the client bundle using `npm run bundle`.

* We only need the *body_bytes_sent*, *request_time*, and *request* fields.

---
tail -f this file and pipe it into server.js

```
tail -f /var/log/dash/www-access.log | node server.js
```

Or to view the logs of a remote server:
```
ssh foo@bar.com 'tail -f /var/log/access.log' | node server.js
```

* Thanks to http://bl.ocks.org/WardCunningham/5861122 for an example of using a d3 forced graph.*
