# Dragon Math

Интерактивное приложение для изучения математики в игровой форме.

## Описание

Dragon Math - это образовательное приложение, которое помогает детям изучать математику через увлекательные игры и задания. Приложение включает в себя различные уровни сложности и интерактивные элементы для лучшего усвоения материала.

## Технологии
- React
- Vite
- TypeScript
- TailwindCSS

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/RuFalcon/dragon_math
```

2. Перейдите в директорию проекта:
```bash
cd dragon-math
```

3. Установите зависимости:
```bash
npm install
```

## Запуск

Для запуска приложения выполните:
```bash
npm start
```

Приложение будет доступно по адресу `http://localhost:3000`

## Разработка

Для запуска в режиме разработки:
```bash
npm run dev
```

## Развертывание на GitHub Pages

1. Создайте новый репозиторий на GitHub
2. Настройте GitHub Pages в настройках репозитория:
   - Перейдите в Settings > Pages
   - В разделе "Source" выберите "GitHub Actions"
3. Создайте файл `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

4. Отправьте изменения в репозиторий:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

После успешного развертывания, ваше приложение будет доступно по адресу:
`https://your-username.github.io/dragon_math/`

## Лицензия

MIT 