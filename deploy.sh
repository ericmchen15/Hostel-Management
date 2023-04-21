#!/bin/bash

# Update the system and install required packages
sudo apt-get update
sudo apt-get -y install nginx

# Stop the Nginx service if it is already running
sudo systemctl stop nginx

curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get -y install nodejs


# Create an Nginx server block configuration file for your Node.js app
sudo tee /etc/nginx/sites-available/hostel-mgmt <<EOF
server {
    listen 80;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the new server block by creating a symbolic link to it
sudo ln -s /etc/nginx/sites-available/hostel-mgmt /etc/nginx/sites-enabled/

# Remove the default Nginx server block configuration file
sudo rm /etc/nginx/sites-enabled/default

cp ~/.env ~/app

# Restart the Nginx service
sudo systemctl start nginx

npm i

sudo npm install pm2 -g

pm2 delete all

pm2 --name Hostel-Management start npm -- start


