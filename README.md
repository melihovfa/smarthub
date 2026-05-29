# SmartHub

SmartHub — статический портал о технологиях, искусственном интеллекте и цифровых инструментах.

## Быстрый запуск

1. Скопируйте файлы проекта в репозиторий `smarthub`.
2. Откройте `index.html` локально или включите GitHub Pages.
3. Для обновления новостей установите зависимости:

```bash
npm install
npm run update
```

## GitHub Pages

В репозитории откройте:

`Settings → Pages → Build and deployment → Deploy from a branch`

Выберите ветку `main` и папку `/root`.

## Автообновление

Файл `.github/workflows/update.yml` запускает обновление каждый день.

## MAX

Для публикации в MAX добавьте в GitHub Secrets:

- `MAX_BOT_TOKEN`
- `MAX_CHAT_ID`
- `SITE_URL`

Если токены не заданы, сайт всё равно будет обновляться, а публикация в MAX будет пропущена.
