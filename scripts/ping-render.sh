#!/bin/bash
curl -s -o /dev/null -w "%{http_code}" --max-time 30 "https://discord-oauth2-rpc-v2.onrender.com/health"
