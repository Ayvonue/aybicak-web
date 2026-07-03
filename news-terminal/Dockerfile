# Tek imaj, dört rol: web (next start), ws-gateway, ingest worker, ticker
# worker. Rol, compose/fly "command" alanıyla seçilir. Worker'lar tsx ile
# çalıştığı için dev bağımlılıkları imajda tutulur — MVP'de basitlik,
# imaj boyutu optimizasyonu ayrı bir iş.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Web rolü için üretim derlemesi (worker rolleri bunu kullanmaz ama tek
# imaj yaklaşımında build'i baştan almak deploy'u basitleştirir).
# DATABASE_URL build sırasında gerekmez; sayfalar runtime'da veri çeker.
RUN npm run build

EXPOSE 3000 3312

# Varsayılan rol: web. Diğer roller: npm run ws:gateway | ingest:watch | ticker:watch
CMD ["npm", "run", "start"]
