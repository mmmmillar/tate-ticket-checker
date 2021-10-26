git clone --depth=1 https://github.com/alixaxel/chrome-aws-lambda.git && \
cd chrome-aws-lambda && \
make chrome-lambda-layer.zip
mv chrome-lambda-layer.zip ../chrome-lambda-layer.zip
cd ..
rm -rf chrome-aws-lambda
