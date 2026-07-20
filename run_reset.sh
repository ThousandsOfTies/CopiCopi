#!/bin/bash
TOKEN=$(gcloud auth print-access-token)
node /home/user/Yurufuwa/CopiCopi/reset.cjs "$TOKEN"
