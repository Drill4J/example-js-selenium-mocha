FROM node:16.13.0-alpine

# Create tests directory
WORKDIR /usr/src/example-tests

COPY . .
# RUN npm install

# Setup env
ENV APP_URL=$APP_URL
ENV SELENIUM_HUB_URL=$SELENIUM_HUB_URL
# Drill4J related params
ENV DRILL4J_ADMIN_BACKEND_URL=$DRILL4J_ADMIN_BACKEND_URL
ENV DRILL4J_DEVTOOLS_PROXY_URL=$DRILL4J_DEVTOOLS_PROXY_URL
ENV DRILL4J_AGENT_ID=$DRILL4J_AGENT_ID
# ENV DRILL4J_GROUP_ID=$DRILL4J_GROUP_ID

# Setup wait utility
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.7.3/wait /wait
RUN chmod +x /wait

# Launch
EXPOSE 8080
# CMD /wait && ls
#// ./run-tests.sh
CMD /wait && npm run test_with_recommendations