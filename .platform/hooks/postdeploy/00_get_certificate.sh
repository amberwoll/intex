#!/usr/bin/env bash
# Place in .platform/hooks/postdeploy directory
sudo certbot -n -d volunteer-turtleshelterproject.org --nginx --agree-tos --email awoll@byu.edu
sudo certbot -n -d intex-2-4.us-east-1.elasticbeanstalk.com --nginx --agree-tos --email awoll@byu.edu