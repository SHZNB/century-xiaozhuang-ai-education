FROM node:24-alpine

WORKDIR /app
COPY package.json ./
COPY server ./server
COPY assets ./assets
COPY docs ./docs
COPY index.html styles.css app.js .nojekyll ./

ENV NODE_ENV=production
ENV PORT=8080
ENV DATA_DIR=/data

RUN mkdir -p /data/uploads && chown -R node:node /app /data
USER node

EXPOSE 8080
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.mjs"]
