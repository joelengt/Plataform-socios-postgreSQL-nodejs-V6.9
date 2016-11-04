server {
        listen 443;

        # Make site accessible from http://localhost/
        server_name ascent.pe;
        ssl on;
        ssl_certificate /etc/ssl/SSL.crt;
        ssl_certificate_key /etc/ssl/server.key;

        location / {
             proxy_pass http://192.241.171.109:6002;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection 'upgrade';
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
        }
}


server {
     listen 80;

       # Make site accessible from http://localhost/
       return 301 https://$host$request_uri;
}

# Redirect http://www.ascent.pe to https://ascent.pe
server {
    listen 80;

    server_name www.ascent.pe;
    return 301 https://ascent.pe$request_uri;
}

# Redirect https://www.ascent.pe to https://acent.pe
server {
   listen 443;

   server_name www.ascent.pe;
   return 301 $scheme://ascent.pe$request_uri;
}