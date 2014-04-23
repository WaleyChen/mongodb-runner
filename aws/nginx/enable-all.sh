#!/usr/bin/env bash

sudo ln -s /etc/nginx/sites-available/scope /etc/nginx/sites-enabled/scope;
sudo ln -s /etc/nginx/sites-available/cube-collector /etc/nginx/sites-enabled/cube-collector;
sudo ln -s /etc/nginx/sites-available/cube-evaluator /etc/nginx/sites-enabled/cube-evaluator;
