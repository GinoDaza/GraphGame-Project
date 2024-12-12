FROM node:23-slim
WORKDIR /app
COPY . .
RUN npm install
RUN cd src/
EXPOSE 3000
CMD ["node", "app.js"]